import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token
} from '@capacitor/push-notifications';
import { DetailService } from '../services/detail.service';
import { SQLiteService } from '../services/sqlite.service';
import { dataToImport } from '../util/import-json-utils';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {

  constructor(
    private _sqlite: SQLiteService,
  ) { }

  _database: SQLiteDBConnection;

  ngOnInit(): void {
    console.log('Initializing HomePage');
    // init push notification
    // this.pushNotificationSetup();

  }


  async ngAfterViewInit() {
    // Initialize the CapacitorSQLite plugin
    console.log("%%%% in TestimportjsonPage this._sqlite " +
      this._sqlite)
    try {
      await this.setupDatabase();

    } catch (e) {
      console.log(`setupDatabase failed >> ${e.message}`);
    }
  }

  async setupDatabase() {
    console.log(" setupDatabase");

    // let result: any = await this._sqlite.echo("setupDatabase");
    // console.log(" from Echo " + result.value);
    // test Json object validity
    // result = await this._sqlite.isJsonValid(JSON.stringify(dataToImport));
    // if (!result.result) {
    //   return Promise.reject(new Error("IsJsonValid failed"));
    // }

    // full import
    let result: any = await this._sqlite.importFromJson(JSON.stringify(dataToImport));
    console.log(`full import result ${result.changes.changes}`);

    if (result.changes.changes === -1) {
      return Promise.reject(
        new Error("ImportFromJson 'full' dataToImport failed")
      );
    }


    // create the connection to the database
    let db = await this._sqlite.createConnection(
      "db-from-json",
      false,
      "no-encryption",
      1);

    if (db === null) return Promise.reject(
      new Error("CreateConnection 'db-from-json' failed")
    );

    // open db "db-from-json"
    await db.open();

    /* i do NOT know what is that 
    // create synchronization table 
    result = await db.createSyncTable();
    if (result.changes.changes < 0) return Promise.reject(
      new Error("CreateSyncTable failed")
    );


    result = await db.getSyncDate();
    if (result.length === 0) return Promise.reject(
      new Error("GetSyncDate failed")
    );
    */
    console.log("$$ syncDate " + result);

    this._database = db;
  }

  /*
  id, email, name, age, last_modified
  [1,"Whiteley.com","Whiteley",30.5,1582536810],
  */

  async getAllUsers() {

    let allUser = await this._database.query("SELECT * FROM users;");
    // var x = JSON.stringify(allUser.values.map(e => {
    //  console.log
    //   return `${e.JSON.parse().id}- `;
    // }).toString());
    // console.log(`x= ${x}`)

    alert("allUsersLen >> " + allUser.values.length);
  }

  async inserNewUser() {
    var age = 25;
    age += 5;

    // const statement = `INSERT INTO products (name, currency, value, vendorid) 
    // VALUES ('${name}','EUR', ${randomValue}, ${randomVendor});`;

    // let sqlcmd: string =
    //   "UPDATE users SET name = ?, email = ? WHERE id = 1;";
    // let values: Array<any> = ["updatedName", "updatedEmail"];

    let sqlcmd: string =
      "INSERT INTO users (email, name, age, last_modified) VALUES (? , ?, ?, ?); ";
      let values = ["newEmailcom", "newName", age, 15,1590383895];


    let insetUserStatment = `INSERT INTO users (email, name, age, last_modified)
    VALUES ('newEmailcom' , 'newName', '${age}', '15,1590383895');`;
    try {
      let res = await this._database.execute(insetUserStatment, false);
      alert(`insertChange =  ${res.changes.changes}`);

    } catch (e) {
      alert(`inset error = ${e} `);
    }

  }

  async getFirstUser() {
    let getFirstUser: string =
      "SELECT * from users  WHERE id = 1;";
    let user = await this._database.run(getFirstUser);

    alert(`userName= ${user.changes.changes[0].name}, changes= ${user.changes.changes}`);
  }

  async deleteFirstUser() {
    let deleteUserCmd: string =
      "Delete from users  WHERE id = 1;";
    let res = await this._database.run(deleteUserCmd);

    alert(`DeleteFristUSerChanges= ${res.changes.changes}`);

  }


  async deleteAllUser() {
    let deleteAllCmd: string = "Delete from users ";
    let res = await this._database.run(deleteAllCmd);

    alert(`deleteAllChanges= ${res.changes.changes}`);

  }

  async updateUserFirstUser() {
    let sqlcmd: string =
      "UPDATE users SET name = ?, email = ? WHERE id = 1;";
    let values: Array<any> = ["updatedName", "updatedEmail"];
    await this._database.run(sqlcmd, values);
  }

  pushNotificationSetup(): void {
    PushNotifications.requestPermissions().then(
      res => {
        if (res.receive === 'granted') {
          PushNotifications.register();
        } else {
          console.log('receive NOT granted');
        }
      }
    );

    PushNotifications.addListener('registration',
      (token: Token) => {
        alert('Push registration success, token: ' + token.value);
      });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

}
