import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import {Http} from '@capacitor-community/http'

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token
} from '@capacitor/push-notifications';
import { DetailService } from '../services/detail.service';
import { SQLiteService } from '../services/sqlite.service';
import { dataToImport } from '../util/import-json-utils';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit, AfterViewInit {

  
  constructor(
    private _sqlite: SQLiteService
  ) { }

  _database: SQLiteDBConnection;

  ngOnInit(): void {
    console.log('Initializing HomePage');
    // init push notification
    // this.pushNotificationSetup();

  }


  async getRequest(){
    const options = {
      url: 'https://example.com/my/api',
      headers: { 'X-Fake-Header': 'Max was here' },
      params: { size: 'XL' },
    };
    let res = await Http.get(options);
    console.log(`status= ${res.status}, data= ${res.data}`);
    // or
    // const response = await Http.request({ ...options, method: 'GET' })

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

    console.log("$$ syncDate " + result);

    this._database = db;
  }

  async getAllUsers() {

    let allUser = await this._database.query("SELECT * FROM users;");

    for (var i = 0; i < allUser.values.length; i++) {
      console.log(`${allUser.values[i].id}, ${allUser.values[i].name}, ${allUser.values[i].email}, ${allUser.values[i].age}`);
    }
    alert("allUsersLen >> " + allUser.values.length);
  }

  async inserNewUser() {
    var age = 25;
    age += 5;

    // let sqlcmd: string =
    //   "INSERT INTO users (email, name, age, last_modified) VALUES (? , ?, ?, ?); ";
    //   let values = ["newEmailcom", "newName", age, 15,1590383895];

    let insetUserStatment = `INSERT INTO users (email, name, age, last_modified)
    VALUES ('newEmailcom' , 'newName', '${age}', '15,1590383895');`;
    try {
      let res = await this._database.execute(insetUserStatment, false);
      console.log(`res= ${res}`);
      alert(`insertChange =  ${res.changes.changes}`);

    } catch (e) {
      alert(`inset error = ${e} `);
    }

  }

  async getFirstUser() {
    let getFirstUser: string =
      "SELECT * from users  WHERE id = 1;";
    let user = await this._database.query(getFirstUser);

    alert(` changes= ${user.values.length}, userName= ${user.values[0].name}`);
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
    let res = await this._database.run(sqlcmd, values);
    alert(`updatueUser= ${res.changes.changes}`);

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
