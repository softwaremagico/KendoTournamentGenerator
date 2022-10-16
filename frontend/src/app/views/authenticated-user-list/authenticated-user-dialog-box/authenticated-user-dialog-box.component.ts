import {Component, Inject, OnInit, Optional} from '@angular/core';
import {Action} from "../../../action";
import {AuthenticatedUser} from "../../../models/authenticated-user";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";

@Component({
  selector: 'app-authenticated-user-dialog-box',
  templateUrl: './authenticated-user-dialog-box.component.html',
  styleUrls: ['./authenticated-user-dialog-box.component.scss']
})
export class AuthenticatedUserDialogBoxComponent implements OnInit {

  authenticatedUser: AuthenticatedUser;
  title: string;
  action: Action;
  actionName: string;
  hidePassword: boolean = true;
  repeatedPassword: string;

  registerForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AuthenticatedUserDialogBoxComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { title: string, action: Action, entity: AuthenticatedUser }) {
    this.authenticatedUser = data.entity;
    this.title = data.title;
    this.action = data.action;
    this.actionName = Action[data.action];
    this.repeatedPassword = "";

    this.registerForm = new FormGroup({
      username: new FormControl({value: '', disabled: this.action !== Action.Add}, Validators.required),
      name: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{7,}$')]),
      repeatPassword: new FormControl('', Validators.required)
    }, {validators: confirmPasswordValidator});
  }

  ngOnInit(): void {
    this.registerForm.markAllAsTouched();
  }

  doAction() {
    this.dialogRef.close({data: this.authenticatedUser, action: this.action});
  }

  closeDialog() {
    this.dialogRef.close({action: Action.Cancel});
  }

  passwordMatch(): boolean {
    return this.action != Action.Add || !this.hidePassword || this.authenticatedUser.password === this.repeatedPassword;
  }


  public isOnCreation() {
    return this.action === Action.Add;
  }
}

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const repeatPassword = control.get('repeatPassword');
  return password && repeatPassword && password.value === repeatPassword.value ? null : {repeatPassword: false};
};
