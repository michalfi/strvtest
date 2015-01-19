STRV test project
====================
Written when applying for a position at STRV. It is a simple RESTful API written in
node.js and express.js.

Author: Michal Fiedler

Changes
--------
Token parameter name for the `contacts` resource was changed to `access_token`, because that's what RFC6750 requires (http://tools.ietf.org/html/rfc6750#section-2.2).

API
=======

Create user account
--------

### Request

~~~HTTP
POST: /accounts HTTP/1.1
Content-type: application/json
~~~

~~~JSON
{
  "email": "USER_EMAIL",
  "password": "USER_PASSWORD"
}
~~~

### Response

~~~HTTP
HTTP/1.1 201 Created
~~~

### Errors

Type        | Description
----------- | -----------
EmailExists | Specified e-mail address is already registered.


Authenticate user
--------

### Request

~~~HTTP
GET: /access_token HTTP/1.1
~~~

Parameter | Description
--------- | -----------
email     | The user's e-mail address
password  | The user's password

### Response

~~~HTTP
HTTP/1.1 200 OK
~~~

~~~JSON
{
  "access_token": "ACCESS_TOKEN"
}
~~~

### Errors

Type                 | Description
-------------------- | -----------
InvalidEmailPassword | Specified e-mail / password combination is not valid.


Create a contact
--------

### Request

~~~HTTP
POST: /contacts HTTP/1.1
~~~

Parameter        | Description
---------------- | -----------
access_token     | The access token obtained based on successful authentication

~~~JSON
{
  "firstName": "FIRST_NAME",
  "lastName": "LAST_NAME",
  "phone": "PHONE_NUMBER"
}
~~~

### Response

~~~HTTP
HTTP/1.1 201 Created
~~~


Upload a photo
--------

### Request

~~~HTTP
POST: /photos?contactId=CONTACT_ID HTTP/1.1
Content-Type: multipart/form-data
~~~

### Response

~~~HTTP
HTTP/1.1 201 Created
~~~


Error format
============

All errors are returned in the format specified below with the appropriate  HTTP status code.

~~~HTTP
HTTP/1.1 4xx ...
~~~

~~~JSON
{
  "type": "ERROR_TYPE",
  "message": "DEBUG_MESSAGE"
}
~~~ 