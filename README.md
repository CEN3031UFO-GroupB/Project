# CEN3031 UFO Group B - Accountability App

A web app that allows clients to write down their goals for the week and allows their life coach to view and provide feedback on their progress. 

## Deployed Project

https://cen3031-groupb-lifecoaching.herokuapp.com/

## Technology Used/Credits
* MEAN.JS (Entire application)
* Bootstrap (Entire application - front-end)
* AngularJS (Entire application - front-end)
* jQuery (Entire application - front-end)
* jQuery UI (Profiles module)
* Chart.js (Goals/Users modules)
* Angular-UI (Profiles module)
* Angular Smart Table (Goals/Admin_verifications/Users modules)
* MailGun (Goals module)
* node-schedule (Goals module)
* Angular Chart (Goals/Users modules)
* Moment.js (Entire application)

## Features

### Login

Landing page for unregistered users.

![Login page](/documentation/screenshots/sign-in.jpg?raw=true "Login page")

### Registration

![Registration page](/documentation/screenshots/sign-up.jpg?raw=true "Registration page")

### Admin

#### User statistics

Landing page for admins.

![Admin statistics](/documentation/screenshots/admin_statistics_users_redacted.jpg?raw=true "Admin statistics")

#### Admin Verification Codes

![Registration codes](/documentation/screenshots/admin_verification_redacted.jpg?raw=true "Registration codes")

#### Notification Settings

![Notification settings](/documentation/screenshots/admin_notifications_settings.jpg?raw=true "Notification settings")

### User

#### Profile

![Profile page](/documentation/screenshots/user_profile.jpg?raw=true "Profile page")

#### Goals (statistics)

Landing page for registered users.

![Goals page](/documentation/screenshots/user_goals.jpg?raw=true "Goals page")

#### Rewards

![Rewards page](/documentation/screenshots/user_rewards.jpg?raw=true "Rewards page")

## Run Project locally

Clone the project using git's client in a specific folder:

```
git clone https://github.com/CEN3031UFO-GroupB/Project.git
```

Install all back-end dependencies:

```
npm install
```

Install all front-end dependencies:

```
bower install
```

Run the server:

```
grunt --force
```

Once the server started, navigate to localhost:3000/ within your browser.

## Update database connection

The configuration files can be found within the /config/env folder. The production.js file will have to be edited if a new production database will be added. 
The changes will be identical when changing the test database (test.js) or the development database (development.js). The new database connection string will
have to be added on line 11 for the production file and on line 7 for the development and test files. See below:

```
module.exports = {
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'YOUR CONNECTION STRING HERE',
    options: {
      user: '',
      pass: ''
    },
```

Note: If the application is deployed, the connection string can also be added as the environment variable "process.env.MONGOLAB_URI".