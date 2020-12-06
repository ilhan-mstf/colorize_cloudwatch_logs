The purpose of this extension is to group logs visually on AWS CloudWatch. There are three rules:
- Set a different background color for each log group of AWS Lambda invocation. Therefore, you can easily recognize beginning, body and end of the logs of the same invocation.
- Set font weight of lines having `REPORT`, `[ERROR]` and `[Error ` keywords to bold.
- Set text color of ANSI terminal codes in the logs. (by https://github.com/oguimbal)

Further, there is two functionality for better log viewing experience (by https://github.com/oguimbal):
- Switching to fullscreen,
- Refreshing the logs periodically to load new items.

This extension doesn't collect any user and web page information. It only runs on AWS CloudWatch Logs web page. It is free to use.

Overhead is very low, colorize operation takes ~7 milliseconds, listen operation for new event logs takes just ~0.5 milliseconds in every second.

Contributions are welcome. To contribute please visit project page: https://github.com/ilhan-mstf/colorize_cloudwatch_logs

Release Log:
--------------------
Version 0.5.1:
- Enable font override on new ui

Version 0.5.0:
- Handle new ui
- Case insensitive error line search

Version 0.4.11:
- Add `[Error ` as a special line to make it bold
- Add "Fullscreen" and "Follow tail" buttons

Version 0.3.8:
- Set text color of ANSI terminal codes
- Update extension logo
- Improve performance

Version 0.2.1:
- Make bold font weight of `REPORT` and `[ERROR]` lines