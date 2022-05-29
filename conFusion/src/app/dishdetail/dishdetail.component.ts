import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../service/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder,FormGroup,Validator} from "@angular/forms";
import {Usercomment} from '../shared/usercomment';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
})
export class DishdetailComponent {
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  usercommentsform:FormGroup;
  usercomments:Usercomment;

  constructor(
    private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb:FormBuilder
  ) {
    this.createForm();
  }
  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id);});

  }
  createForm()
  {
    this.usercommentsform=this.fb.group({
     name:'',
      agree:0,
      message:'',


    });
  }
  onSubmit() {
    this.usercomments = this.usercommentsform.value;
    console.log(this.usercomments);
    this.usercommentsform.reset();
  }
setPrevNext(dishId :string)
{
  const index = this.dishIds.indexOf(dishId);
  this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
  this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
}

  goBack(): void {
    this.location.back();
  }
}
