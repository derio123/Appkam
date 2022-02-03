import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';
import { UserPhoto } from 'src/app/models/userphoto';
import { Platform } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;

  constructor(platform: Platform) { 
    this.platform = platform;
  }

  private async saveImage(photo: Photo) {
    //Convert for base64
    const base64Data = await this.readAsBase64(photo);

    const photoFile = new Date().getTime() + '.png';
    const savedFile = await Filesystem.writeFile({
      path: photoFile,
      data: base64Data,
      directory: Directory.Data
    });

    if(this.platform.is("hybrid")) {
      return {
          filepath: savedFile.uri,
          webviewPath:Capacitor.convertFileSrc(savedFile.uri)
      }
    } else {

      return {
        filepath: photoFile,
        webviewPath: photo.webPath
      }
    }
   } 

  private async readAsBase64(photo) {

    if(this.platform.is("hybrid")){
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;

    } else {
      const res = await fetch(photo.webPath!);
      const blob = await res.blob();

      return await this.convertBlobBase64(blob) as string
     }
  }


  convertBlobBase64 = (blob: Blob) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = () => {
      res(reader.result);
    };

    reader.readAsDataURL(blob);
  });

  public async loadPhotos() {
    const listPhoto = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(listPhoto.value) || [];

    if(!this.platform.is("hybrid")) {
      for(let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data
        });

      photo.webviewPath = `data:image/png;base64, ${readFile.data}`;  
      }
    }
  }

  /**
   * addNewPhoto add uma nova foto
   */
  public async addNewPhoto() {
    const photoCapture = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality:100,
    });

    const savedImage = await this.saveImage(photoCapture);
    this.photos.unshift(savedImage);

    Storage.set({
      key: this.PHOTO_STORAGE, 
      value: JSON.stringify(this.photos)
    })

    /*this.photos.unshift({
      filepath: 'Em breve',
      webviewPath: photoCapture.webPath
    });*/
  }

  public async selectPhotos() {
    const img = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    console.log(img);

    if(img) {
      const savedSelected = await this.saveImage(img);
      this.photos.unshift(savedSelected);
    }

    Storage.set({
      key: this.PHOTO_STORAGE, 
      value: JSON.stringify(this.photos)
    })
  }

  public async removePhotos(photo: UserPhoto, position: number) {
    this.photos.splice(position, 1);


    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    const filePhoto = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({ path: filePhoto, directory: Directory.Data });
  }
}
