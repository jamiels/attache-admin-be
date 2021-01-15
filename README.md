## Table of contents

- [Local deployment](#--local-deployment)
- [Using endpoints](#--using-endpoints)
  - [Account registration](#--account-registration) 
  - [Authentication](#--authentication) 
  - [Password reset](#--password-reset) 
  - [REST API](#--rest-api)

# Local deployment

If needed install yarn/npm and node.js.

```
$ git clone https://github.com/jamiels/attache-admin-be
$ cd attache-admin-be
$ yarn install
```

If you just want to start the server

`$ yarn run start`
or
`$ npm run start`

If you want to enable server restart on file changes

`$ yarn run devstart`
or
`$ npm run devstart`

App runs on [http://localhost:9000/](http://localhost:9000/)

# Using endpoints

Routes are declared/defined in routes/index.js file.

In the case of post requests body must consist of JSON data. To send JSON data with Postman, one has to choose body type raw, and then, in the dropdown, on the right, pick JSON.

Each request sent to /register, /authenticate, /sendResetToken, /resetPassword is validated. Should it fail it will return 422 error.

Requests sent to REST API endpoints aren't validated. They require Authorization header with JWT Token.

Example request sent with Postman:

![postman request](https://i.imgur.com/hiVoGVy.png)

## Account registration

#### /register

Request body should look like this:

```JSON
{
  "login": "placeholder",
  "password": "placeholder",
  "firstName": "placeholder",
  "lastName": "placeholder placeholder",
  "email": "placeholder@example.com"
}
```

You can see the response format on the image above. This token can be used to authorize requests.

## Authentication

#### /authenticate

Request body should look like this:

```JSON
{
  "login": "placeholder",
  "password": "placeholder"
}
```

Response format is similar to the register endpoint.

## Password reset

To reset the password two requests need to be performed.

#### /sendResetToken

```JSON
{
  "email": "placeholder@example.com"
}
```

Reset token will be sent to the specified email address. Please check spam folder.

#### /resetPassword

```JSON
{
	"resetToken":"72a8af36a3a6d5ee1b7eaec78abcdefgh4fdd88a0",
   "password": "new_password"
}
```

## REST API

#### VIDEO

- `GET /VIDEO`
- `GET /VIDEO/:id `
- `POST /VIDEO`
- `PATCH /VIDEO/:id`
- `DELETE /VIDEO/:id `

#### USER

- `GET /USER`
- `GET /USER/:id`
- `POST /USER`
- `PATCH /USER/:id`
- `DELETE /USER/:id `

All requests specified below require Authorization header with JWT Token, that can be obtained as a response from /register, /authenticate, /resetPassword endpoints.

These endpoints follow the REST architecture. Currently only VIDEO and USER tables are available through the API.
