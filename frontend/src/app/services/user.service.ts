import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {AuthenticatedUser} from "../models/authenticated-user";
import {catchError, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {EnvironmentService} from "../environment.service";
import {CookieService} from "ngx-cookie-service";
import {SystemOverloadService} from "./notifications/system-overload.service";
import {LoggerService} from "./logger.service";
import {MessageService} from "./message.service";
import {LoginService} from "./login.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = this.environmentService.getBackendUrl() + '/auth/public';

  constructor(private http: HttpClient, private environmentService: EnvironmentService,
              private cookies: CookieService, private systemOverloadService: SystemOverloadService,
              public loginService: LoginService,
              private loggerService: LoggerService, private messageService: MessageService) {

  }

  getAll(): Observable<AuthenticatedUser[]> {
    const url: string = `${this.baseUrl}`;
    return this.http.get<AuthenticatedUser[]>(url, this.loginService.httpOptions)
      .pipe(
        tap({
          next: () => this.loggerService.info(`fetched all users`),
          error: () => this.systemOverloadService.isBusy.next(false),
          complete: () => this.systemOverloadService.isBusy.next(false),
        }),
        catchError(this.messageService.handleError<AuthenticatedUser[]>(`gets all`))
      );
  }

  add(authenticatedUser: AuthenticatedUser): Observable<AuthenticatedUser> {
    const url: string = `${this.baseUrl}`;
    return this.http.post<AuthenticatedUser>(url, authenticatedUser, this.loginService.httpOptions)
      .pipe(
        tap({
          next: (_authenticatedUser: AuthenticatedUser) => this.loggerService.info(`adding user ${_authenticatedUser}`),
          error: () => this.systemOverloadService.isBusy.next(false),
          complete: () => this.systemOverloadService.isBusy.next(false),
        }),
        catchError(this.messageService.handleError<AuthenticatedUser>(`adding ${authenticatedUser}`))
      );
  }

  update(authenticatedUser: AuthenticatedUser): Observable<AuthenticatedUser> {
    const url: string = `${this.baseUrl}`;
    return this.http.put<AuthenticatedUser>(url, authenticatedUser, this.loginService.httpOptions)
      .pipe(
        tap({
          next: (_authenticatedUser: AuthenticatedUser) => this.loggerService.info(`updating user ${_authenticatedUser}`),
          error: () => this.systemOverloadService.isBusy.next(false),
          complete: () => this.systemOverloadService.isBusy.next(false),
        }),
        catchError(this.messageService.handleError<AuthenticatedUser>(`updating ${authenticatedUser}`))
      );
  }

  delete(authenticatedUser: AuthenticatedUser): Observable<AuthenticatedUser> {
    const url: string = `${this.baseUrl}/delete`;
    return this.http.post<AuthenticatedUser>(url, authenticatedUser, this.loginService.httpOptions)
      .pipe(
        tap({
          next: () => this.loggerService.info(`deleting user ${authenticatedUser}`),
          error: () => this.systemOverloadService.isBusy.next(false),
          complete: () => this.systemOverloadService.isBusy.next(false),
        }),
        catchError(this.messageService.handleError<AuthenticatedUser>(`delete ${authenticatedUser}`))
      );
  }
}
