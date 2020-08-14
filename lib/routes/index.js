(appllicationRoutes => {
  "use strict";

  appllicationRoutes.init = app => {
    const HTTPStatus = require("http-status");
    const rateLimiter = require("../middlewares/rate-limiter");
    const emailValidator = require("../helpers/email-validator");
    const tokenAuthMiddleware = require("../middlewares/token-authentication");

    rateLimiter.init(app);

    // const emailTemplateRouter = require("../modules/email-template/route");
    // app.use(
    //   "/api/email-template",
    //   tokenAuthMiddleware.authenticate,
    //   emailTemplateRouter
    // );

    // const loginAttemptLogRouter = require("../modules/login-logs/route");
    // app.use(
    //   "/api/logs/login-attempts",
    //   tokenAuthMiddleware.authenticate,
    //   loginAttemptLogRouter
    // );

    const userConfirmationRouter = require("../modules/user-confirmation/route");
    app.use("/api/confirm/user", userConfirmationRouter);

    const passwordChangeVerifyRouter = require("../modules/password-change/route");
    app.use("/api/password-reset/user", passwordChangeVerifyRouter);

    const multiFactorAuthenticationRouter = require("../modules/multi-factor-auth/route");
    app.use("/api/multi-factor-auth", multiFactorAuthenticationRouter);

    const loginRouter = require("../modules/login-auth/route");
    app.use("/api", rateLimiter.rateLimitByIpAddress, loginRouter);

    const userRouter = require("../modules/user-profile/route");
    app.use("/api/user", userRouter);

    const userUnBlockRouter = require("../modules/user-unblock/route");
    app.use("/api/unblock/user", userUnBlockRouter);

    const roleRouter = require("../modules/role/route");
    app.use("/api/role", tokenAuthMiddleware.authenticate, roleRouter);

    const mobileIdentifierRouter = require("../modules/mobile-identiifer/route");
    app.use("/api/mobile-identifier", mobileIdentifierRouter);

    const notificationRouter = require("../modules/notifications/route");
    app.use(
      "/api/notification",
      tokenAuthMiddleware.authenticate,
      notificationRouter
    );

    const menuBarRouter = require("../modules/menu-bar/route");
    app.use(
      "/api/menu-bar-items",
      tokenAuthMiddleware.authenticate,
      menuBarRouter
    );

    const apiEndpointsRouter = require("../modules/api-endpoints/route");
    app.use(
      "/api/api-endpoints",
      tokenAuthMiddleware.authenticate,
      apiEndpointsRouter
    );

    const contactUsRouter = require("../modules/contact-us/route");
    app.use("/api/contact-us", contactUsRouter);

    // catch 404 and forward to error handler
    app.use('/api/*', (req, res, next) => {
        commonHelper.sendResponseData(res, {
            status: HTTPStatus.NOT_FOUND,
            message: 'Api Route not available'
        });
    });
  };
})(module.exports);
