import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Http, HttpUploadFileResult } from '@capacitor-community/http';
// import { Http } from '@capacitor-community/http';

// import { Storage } from '@capacitor/storage';


export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];

  constructor() { }

  auth = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRmU4byIsInJvbGUiOiIzIiwiU2VjdGlvbiI6IjMiLCJuYW1laWQiOiI1MyIsIlJvbGVOYW1lIjoiSW5zcGVjdG9yIiwibmJmIjoxNjE4MTMyMTIxLCJleHAiOjE2NDk2NjgxMjEsImlhdCI6MTYxODEzMjEyMX0.OMNXpVbTvN8Pf8bi7nQfoDCFIgXCSNEPr0M5OxhbiYc";

  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const imgName = new Date().getTime() + '.png';


    // console.log(`imgPath- path= ${capturedPhoto.path}`);
    // console.log(`imgPath- webPath= ${capturedPhoto.webPath}`);
    // console.log(`imgPath- dataUrl= ${capturedPhoto.dataUrl}`);
    // console.log(`imgPath- exif= ${capturedPhoto.exif}`);
    // console.log(`imgPath- base64StringLen= ${capturedPhoto.base64String?.length}`);

    this.photos.unshift({
      filepath: imgName,
      webviewPath: capturedPhoto.webPath
    });

    
    let platform = Capacitor.getPlatform();

    if (platform === 'web') {
      console.log(`platform= web`);
      let webPath = capturedPhoto.webPath;
      //  this.uploadImg(capturedPhoto,'tiger',capturedPhoto.webPath);
      // const fileName = webPath.substr(webPath.lastIndexOf('/') + 1);
      console.log(`tempFilename= ${imgName}`);

      // let pathNotName   =webPath.substr(0, webPath.lastIndexOf('/') + 1);


      this.uploadImg(capturedPhoto, imgName, webPath);

    } else if (platform === 'android') {
      console.log(`platform= android`);

      let androidPath = capturedPhoto.path;
      const fileName = androidPath.substr(androidPath.lastIndexOf('/') + 1);

      this.uploadImg(capturedPhoto, fileName, androidPath);

    }
  }


  async uploadImg(photo: Photo, photoName: string, path: string) {
    console.log(`uploadImg() >> photoName= ${photoName},  
    photoFormat= ${photo.format},
    path= ${path}`);



    // const reader = new FileReader();
    // reader.onload = () => {
    //   //   const formData = new FormData();
    //   let imgBlob = new Blob([reader.result], {
    //     type: photo.format,
    //   });
    // }
    // const imgBlob = new Blob([reader.result], {
    //   type: photo.format,
    // });

    // const formData = new FormData();
    // formData.append('file', path);
    // formData.append("Image", file, fileName + "." + file.type.substring(6, 10));

    
    const options = {
      url: 'http://elmasaderclient.com:5000/upload/File',
      name: photoName,
      filePath: path,
      // data:formData,
      // fileDirectory: imgBlob2,
      // headers: {
      //   'Authorization': this.auth,
      //   // 'Content-Type': 'multipart/form-data'
      // }
    };
    // fileDirectory: FilesystemDirectory.Downloads,
    const res = await Http.uploadFile(options);
    console.log(`status ${res.status}, data= ${JSON.stringify(res)}` );
    // alert(`status ${res.status}, data= ${JSON.stringify(res)} `);
  }

}
