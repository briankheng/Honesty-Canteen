# Honesty Canteen's
A simple "Honesty Canteen's" website, which digitalize the feature of "Kantin Kejujuran" in the real life.
## Getting Started <br>
A deployed app can be access at [https://honestycanteen.herokuapp.com/](https://honestycanteen.herokuapp.com/). But if you want to run it locally instead, 
go get a local copy up and running then follow these simple steps.<br>
1. Run npm install
   ```sh
    npm install
   ```
2. Run node at port 3000
   ```sh
    node app.js
   ```
## Features
* **Register** <br>
  _Only valid ID (consist of a 5 digits number from 0-9 with 2 last digits equal the sum of 3 first digits) and unregistered ID can be register._
* **Login** <br>
  _Only valid ID and password which had already registered can login._
* **Logout** <br>
  _Logging out from the current account._
* **Filter by:**
  * Newest item created
  * Oldest item created
  * Ascending item name
  * Descending item name
* **Add item** <br>
  _Only logged in user can add item to the store._
* **Buy item** <br>
  _Only logged in user can buy item from the store._
* **Balance-Box:** <br>
  _Can only be access by logged in user._
  * Add money <br>
    _Add money to the balance-box with the maximum of unlimited._
  * Withdraw money <br>
    _Withdraw money from the balance-box with the maximum of the current balance._
## Built With
* [Express.js](https://expressjs.com/)
* [Bootstrap](https://getbootstrap.com)
* [Mongodb](https://www.mongodb.com/)
## Contact
Brian Kheng - briankheng63@gmail.com <br>
Project Link: https://github.com/briankheng/Kantin-Kejujuran
