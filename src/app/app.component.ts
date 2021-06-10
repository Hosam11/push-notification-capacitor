import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLiteService } from '../app/services/sqlite.service';
import { DetailService } from './services/detail.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private initPlugin: boolean;
  constructor(
    private platform: Platform,
    private sqlite: SQLiteService,
    private detail: DetailService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.detail.setExistingConnection(false);
      this.detail.setExportJson(false);
      this.sqlite.initializePlugin().then(ret => {
        this.initPlugin = ret;
        console.log(">>>> in App  this.initPlugin " + this.initPlugin)
      });
    });
  }
}
