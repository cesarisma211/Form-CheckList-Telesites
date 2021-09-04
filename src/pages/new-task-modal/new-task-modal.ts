import { Component } from '@angular/core';
import { ViewController, normalizeURL, ToastController, LoadingController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { ImagePicker } from '@ionic-native/image-picker';

@Component({
  selector: 'page-new-task-modal',
  templateUrl: 'new-task-modal.html'
})
export class NewTaskModalPage {

  validations_form: FormGroup;
 images: Array<string> = [];  
  loading: any;

  constructor(
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public formBuilder: FormBuilder,
    public imagePicker: ImagePicker,
    public firebaseService: FirebaseService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewWillLoad(){
    this.resetFields()
  }

  resetFields(){
    this.validations_form = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      site: new FormControl('', Validators.required),
      region: new FormControl('', Validators.required),
      direction: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required)
    });
  }

  dismiss() {
   this.viewCtrl.dismiss();
  }

  onSubmit(value){
  
    let data = {
      title: value.title,
      description: value.description,
      site: value.site,
      region: value.region,
      direction: value.direction,
      images: this.images[8],
    }
    this.firebaseService.createTask(data,this.images)
    .then(
      res => {
        this.resetFields();
        this.viewCtrl.dismiss();
      }
    )
  }

openImagePicker(){
  this.imagePicker.hasReadPermission().then(
    (result) => {
      if(result == false){
        this.imagePicker.requestReadPermission();
      }
      else if(result == true){
        this.imagePicker.getPictures({
          maximumImagesCount: 8
        }).then(
          (results) => {
            for (var i = 0; i < results.length; i++) {
              this.images.push(results[i]);
              this.uploadImageToFirebase(results[i]);
            }
          }, (err) => console.log(err)
        );
      }
    }, (err) => {
      console.log(err);
    });
  }


  uploadImageToFirebase(images){
    this.loading.present();
    images = normalizeURL(images);
    let path = Math.random().toString(16).substr(1);
    //uploads img to firebase storage
    this.firebaseService.uploadImage(images, path)
    .then(photoURL => {
      this.images[8] = photoURL;
      this.loading.dismiss();
      let toast = this.toastCtrl.create({
        message: 'Las imagenes se subieron con exito',
        duration: 3000
      });
      toast.present();
      })
  }

}
