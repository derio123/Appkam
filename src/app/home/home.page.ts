import { Component } from '@angular/core';
import { PhotoService } from '../services/photos/photo.service';
import { ActionSheetController } from '@ionic/angular'
import { UserPhoto } from '../models/userphoto'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public photoServe: PhotoService, public actionSheetCtrl: ActionSheetController ) {}

  async ngOnInit() {
    await this.photoServe.loadPhotos();
  }


  addPhotoGallery() {
    this.photoServe.addNewPhoto();
  }

  selectImage() {
    this.photoServe.selectPhotos();
  }

  public async showActionSheet(photo: UserPhoto, position: number) {
      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Deseja remover as fotos ?',
        buttons: [{
          text: 'Remover',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.photoServe.removePhotos(photo, position);
          } 
        }, {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
          handler: () => {

          }
        }]
      });

      await actionSheet.present();
  }
}

