import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective, NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {ErrorStateMatcher} from "@angular/material/core";

@Component({
  selector: 'app-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.scss']
})
export class PasswordsComponent implements OnInit {

  hidePassword: boolean = true;
  oldPassword: string;
  password: string;
  repeatedPassword: string;
  matcher = new MyErrorStateMatcher();

  passwordForm = new FormGroup({
    oldPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{7,}$')]),
    repeatPassword: new FormControl('', Validators.required)
  }, {validators: confirmPasswordValidator, updateOn: 'change'});

  constructor() {
  }

  ngOnInit(): void {
    this.passwordForm.markAllAsTouched();
  }

  public changePassword() {
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.passwordForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        console.log('invalid', name)
        invalid.push(name);
      }
    }
    return invalid;
  }

  passwordMatch(): boolean {
    return !this.hidePassword && this.password === this.repeatedPassword;
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return invalidCtrl || invalidParent;
  }
}

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword');
  const repeatPassword = control.get('repeatPassword');
  return password && repeatPassword && password.value === repeatPassword.value ? null : {repeatPassword: true};
};
