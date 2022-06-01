import { Component, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../service/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

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
  userCommentsForm: FormGroup;
  newCommant: Comment = {};
  userComment: any;
  @ViewChild('uform') userCommentsFormDirective;

  formErrors = {
    name: '',
    message: '',
  };

  validationMessages = {
    name: {
      required: 'Name is required.',
      minlength: 'First Name must be at least 2 characters long.',
      maxlength: 'FirstName cannot be more than 25 characters long.',
    },
    message: {
      required: 'Message is required.',
      minlength: 'Message  must be at least 25 characters long.',
    },
  };

  constructor(
    private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.dishService
      .getDishIds()
      .subscribe((dishIds) => (this.dishIds = dishIds));
    this.route.params
      .pipe(
        switchMap((params: Params) => this.dishService.getDish(params['id']))
      )
      .subscribe((dish) => {
        this.dish = dish;
        this.setPrevNext(dish.id);
      });
  }

  createForm() {
    this.userCommentsForm = this.fb.group({
      author: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
      rating: [5, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.userCommentsForm.valueChanges.subscribe(() => this.onValueChanged());
  }

  onValueChanged() {
    this.userComment = this.userCommentsForm.value;

    this.newCommant = {
      rating: this.userComment.rating,
      comment: this.userComment.comment,
      author: this.userComment.author,
      date: new Date().toISOString(),
    };
    if (!this.userCommentsForm) {
      return;
    }
    const form = this.userCommentsForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.dish.comments.push(this.newCommant);
    this.userCommentsFormDirective.resetForm();
    this.userCommentsForm.get('rating')?.setValue(5);
    this.newCommant = {};
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev =
      this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next =
      this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  sliderChange(value): void {
    this.userCommentsForm.get('rating')?.setValue(value);
  }
}
