((providerHelper) => {
  'use strict';

  const Promise = require("bluebird");
  const join = Promise.join;

  providerHelper.getPaginatedDataList = (Collection, queryOpts, pagerOpts, projectFields, sortOpts) => {
    return join(Collection
        .find(queryOpts, { projection: projectFields })
        .skip(pagerOpts.perPage * (pagerOpts.page-1))
        .limit(pagerOpts.perPage)
        .sort(sortOpts).toArray(), Collection.countDocuments(queryOpts),
      (dataList, count) => {
        return {
          dataList:dataList,
          totalItems:count,
          currentPage:pagerOpts.page
        };
      });
  };

  providerHelper.getPaginatedDataListWithGeneralLookup = (Collection, queryOpts, pagerOpts, projectFields, sortOpts, lookUpOpts, unwindField) => {
    const matchOpts = {
      $match: queryOpts
    }
    const aggregateMethods = [
      matchOpts,
      { $sort: sortOpts },
      { $skip: pagerOpts.perPage * (pagerOpts.page - 1) },
      { $limit: pagerOpts.perPage },
      { $lookup: lookUpOpts },
      { $unwind: `$${unwindField}` },
      { $project: projectFields }
    ]
    return join(Collection
            .aggregate(
                aggregateMethods
            ).toArray(), Collection.countDocuments(queryOpts),
        (dataList, count) => {
          return {
            dataList:dataList,
            totalItems:count,
            currentPage:pagerOpts.page
          };
        });
  };

  providerHelper.getPaginatedDataListWithLookup = (Collection, queryOpts, pagerOpts, sortOpts, lookupOpts = false, unwindField = false, projectionFields = false, userQueryOpts = null) => {
    const matchOpts = {
      $match: queryOpts
    }
    const aggregateMethods = [ matchOpts ]

    const countQuery = [ matchOpts ]

    if (lookupOpts) {
      aggregateMethods.push({ $lookup: lookupOpts })
      countQuery.push({ $lookup: lookupOpts })
    }
    if (unwindField) {
      aggregateMethods.push({ $unwind: `$${unwindField}` })
      countQuery.push({ $unwind: `$${unwindField}` })
    }
    if (projectionFields) {
      aggregateMethods.push({ $project: projectionFields })
      countQuery.push({ $project: projectionFields })
    }
    if (userQueryOpts) {
      aggregateMethods.push({ $match: userQueryOpts})
      countQuery.push({ $match: userQueryOpts})
    }
    aggregateMethods.push({ $sort: sortOpts })
    aggregateMethods.push({ $skip: pagerOpts.perPage * (pagerOpts.page - 1) })
    aggregateMethods.push({ $limit: pagerOpts.perPage })

    return join(Collection
            .aggregate(
                aggregateMethods
            ).toArray(), Collection.aggregate([...countQuery, {
          $count: "total_items"
        }]).toArray(),
        (dataList, count) => {
          return {
            dataList: dataList,
            totalItems: (count && count.length > 0 && count[0].total_items) ? count[0].total_items : 0,
            currentPage: pagerOpts.page
          }
        })
  }

  providerHelper.checkForDuplicateRecords = async (Collection, queryOpts, objSave) => {
    const count = await Collection.countDocuments(queryOpts);
    if(count > 0){
      return Promise.resolve({
        exists: true
      });
    }else{
      const dataRes = await Collection.insertOne(objSave);
      return Promise.resolve({
        exists: false,
        dataRes: dataRes
      });
    }
  };

  providerHelper.checkForDuplicateRecordsForUpdate = async (Collection, queryOptsCount, queryOptsUpdate, objUpdate) => {
    const count = await Collection.countDocuments(queryOptsCount);
    if(count > 0){
      return Promise.resolve({
        exists: true
      });
    }else{
      const dataRes = await Collection.updateOne(queryOptsUpdate, {$set: objUpdate});
      return Promise.resolve({
        exists: false,
        dataRes: dataRes
      });
    }
  };
})(module.exports);
