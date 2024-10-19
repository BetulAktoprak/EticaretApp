import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../../common/shared/shared.module';
import { NgForm } from '@angular/forms';
import { CategoryModel } from '../../../categories/models/category.model';
import { CategoryService } from '../../../categories/services/category.service';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductModel } from '../../models/product.model';

@Component({
  selector: 'app-product-update',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './product-update.component.html',
  styleUrl: './product-update.component.css'
})
export class ProductUpdateComponent implements OnInit{
  categories: CategoryModel[] = [];
  images: File[] = [];
  imageUrls: any[] = [];
  productId: string = "";
  product: ProductModel = new ProductModel();

  constructor(
    private _category: CategoryService,
    private _toastr: ToastrService,
    private _product: ProductService,
    private _router: Router,
    private _activated: ActivatedRoute
  ) {
    _activated.params.subscribe(res => {
      this.productId = res["id"];
      this.getById();
    })
  }

  ngOnInit(): void {
    this.getCategories();
  }

  getById(){
    let model = {_id: this.productId};
    this._product.getById(model, (res) => (this.product = res));
  }

  getCategories() {
    this._category.getAll((res) => (this.categories = res));
  }

  getImages(event: any) {
    const file: File[] = Array.from(event.target.files);
    this.images.push(...file);

    for (let i = 0; i < event.target.files.length; i++) {
      const element = event.target.files[i];

      const reader = new FileReader();
      reader.readAsDataURL(element);

      reader.onload = () => {
        const imageUrl = reader.result as string;
        this.addImage(imageUrl, file);
      }
    }
  }

  addImage(imageUrl: string, file: any){
    this.imageUrls.push({
      imageUrl: imageUrl, name: file.name, size: file.size
    });
  }

  update(form: NgForm) {
    if(form.value["categoriesSelect"].length == 0){
      this._toastr.error("Kategori seçimi yapmadınız");
      return;
    }

    if(form.valid){
      let categories: string[] = form.value["categoriesSelect"]
    
      let formData = new FormData();
      formData.append("_id", this.productId);
      formData.append("name", form.value.name);
      formData.append("stock", form.value.stock);
      formData.append("price", form.value.price.toString().replace(",", "."));
    

      for(const category of categories){
        formData.append("categories", category);
      }
    
      if(this.images != undefined){
        for(const image of this.images){
          formData.append("images", image, image.name);
        }
      }
    
      this._product.update(formData, res => {
        this._toastr.info(res.message);
        this._router.navigateByUrl("/products");
      });
    }
  }

  deleteImage(_id: string, index: number){
    let model = {
      _id: _id,
      index: index
    }
    this._product.removeImageByProductAndIndex(model, res => {
      this._toastr.warning(res.message);
      this.getById();
    })
  }
}
