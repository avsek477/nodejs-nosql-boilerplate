(() => {
    'use strict';

    module.exports = {
        'system_emails': `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        
        <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Doctors on Call</title>
        <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet">
        <style>
            body {
                font-family: "Montserrat";
            }
        </style>
        </head>

        <body style="padding:0; margin:0 !important; width: 100% !important;
        -webkit-text-size-adjust: 100% !important;
        -ms-text-size-adjust: 100% !important; background-color:#fff;
        -webkit-font-smoothing: antialiased !important;">
        <table style="margin:0 auto;max-width:700px;">
            <tbody>
                <tr>
                    <td>
                        <div>
                            <img style="width: 700px;" src="https://res.cloudinary.com/avsek/image/upload/v1585754399/Email_Header_2_nlemy6.jpg" alt="doctor on call banner" />
                        </div>
                    </td>                                
                </tr>    
                <tr>
                    <td style="padding:20px; color:#333; font-family: 'Montserrat';">
                        %email_content%
                    </td>
                </tr>
                <tr style="background-color:#f0f0f0; color:#333; font-size:12px; font-family: 'Montserrat';">
                    <td>
                        <table style="width:100%;">
                            <tbody>
                                <tr>
                                    <td style="padding-top:30px; padding-bottom:15px;" align="center">
                                        <img style="height: 60px;" src="https://res.cloudinary.com/avsek/image/upload/v1585035976/logo_footer1_hipgqu.png" alt="doctor on call logo" />
                                    </td>
                                </tr>
                                <tr style="text-align:center; ">
                                    <td style="text-justify:center; color:#808080; font-size:10px;padding-bottom:15px;">© Copyright - Doctors On Call - 2020</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
        </body>
        </html>
        `,
        'subscription_emails': `
            
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                
                <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
                
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    <title>Xceltrip</title>
                    <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet">
                    <style>
                        body {
                            font-family: "Montserrat";
                        }
                    </style>
                </head>
                
                <body style="padding:0;
                margin:0 !important;
                width: 100% !important;
                -webkit-text-size-adjust: 100% !important;
                -ms-text-size-adjust: 100% !important; background-color:#fff;
                -webkit-font-smoothing: antialiased !important;">
                    <table style="margin:0 auto;">
                        <tbody>
                            <tr>
                                <td>
                                    <img style="width:100%;max-width: 700px;" src="https://s3.amazonaws.com/xceltoken/header.jpg" alt="xceltrip" /></td>
                            </tr>
                            <tr>
                                <td style="padding:20px; color:#333; font-family: " Montserrat ";">
                                    %email_content%
                                </td>
                            </tr>
                            <tr style="background-color:#f0f0f0; color:#333; font-size:12px; font-family: " Montserrat ";">
                                <td>
                                    <table style="width:100%;">
                <tbody>
                                        <tr>
                                            <td style="padding-top:30px; padding-bottom:15px;" align="center">
                                                <img style="max-width: 150px;" src="https://s3.amazonaws.com/xceltrip/logo.png" alt="xceltrip" />
                                            </td>
                                        </tr>
                                        <tr>
                
                                            <td align="center">
                                                <div style="display:inline-block;">
                                                    <table>
                <tbody>
                                                        <tr>
                                                            <td style="padding-right:20px; vertical-align: top; border-right:1px solid #ddd;">
                                                                Global HQ<span>&#x0003A; </span>1580 Oakland Rd&#44;
                                                                <br>San Jose&#44; California-95131&#44;
                                                                <br>USA </td>
                                                            <td style="padding-left:20px; vertical-align: top;">Asia HQ<span>&#x0003A; </span>10-11 International Plaza&#44;
                                                                <br>10 Anson Road&#44; Singapore 079903 </td>
                                                        </tr>
                
                                                        <tr>
                                                            <td colspan="2" align="center" style="padding-top: 20px; vertical-align: bottom;"><a href="mailto:support@xceltrip.com" style="color:#333;">assets&#64;xceltrip&#46;com</a>
                                        </td>
                                    </tr>
                                                    </tbody>
                                    </table>
                                                </div>
                                            </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:30px; text-align:center;" align="center">
                                                    <b>CONNECT WITH US</b>
                                                    <br/>
                                                    <ul style="display:inline-block; padding-left:0; margin-left:0;">
                                                        <li style="display:inline-block; list-style:none; margin-right:10px;">
                                                            <a target="_blank" href="https://www.linkedin.com/company/ally-energy-solutions/">
                                                            <img style="width: 20px;" src="https://s3.amazonaws.com/xceltrip/linkedin_icon.png" alt="" /></a>
                                                        </li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr style="text-align:center; ">
                                                <td style="text-justify:center; color:#808080; font-size:10px;padding-bottom:15px;">© Copyright - Doctors On Call - 2020</td>
                                            </tr>
                </tbody>
                                                    </table>
                                </td>
                                </tr>
                        </tbody>
                        </table>
                
                </body>
                
                </html>
        `
    };

})();
