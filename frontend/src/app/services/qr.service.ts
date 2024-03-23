import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {EnvironmentService} from "../environment.service";
import {MessageService} from "./message.service";
import {LoggerService} from "./logger.service";
import {LoginService} from "./login.service";
import {SystemOverloadService} from "./notifications/system-overload.service";
import {Observable} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {QrCode} from "../models/qr-code.model";
import {Tournament} from "../models/tournament";

@Injectable({
  providedIn: 'root'
})
export class QrService {

  private baseUrl: string = this.environmentService.getBackendUrl() + '/qr';

  constructor(private http: HttpClient, private environmentService: EnvironmentService, private messageService: MessageService,
              private loggerService: LoggerService, public loginService: LoginService,
              private systemOverloadService: SystemOverloadService) {
  }

  getGuestsQr(tournament: Tournament): Observable<QrCode> {
    const url: string = `${this.baseUrl}/guest/tournament/${tournament.id}`;
    return this.http.get<QrCode>(url)
      .pipe(
        tap({
          next: () => this.loggerService.info(`getting qr code from tournament ${tournament.id}`),
          error: () => this.systemOverloadService.isBusy.next(false),
          complete: () => this.systemOverloadService.isBusy.next(false),
        }),
        catchError(this.messageService.handleError<QrCode>(`getting qr code from tournament ${tournament.id}`))
      );
  }

  getGuestsQrAsPdf(tournament: Tournament): Observable<Blob> {
    this.systemOverloadService.isBusy.next(true);
    const url: string = `${this.baseUrl}/guest/tournament/${tournament.id}/pdf`;
    return this.http.get<Blob>(url, {
      responseType: 'blob' as 'json', observe: 'body', headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap({
        next: () => this.loggerService.info(`getting qr code as pdf from tournament ${tournament.id}`),
        error: () => this.systemOverloadService.isBusy.next(false),
        complete: () => this.systemOverloadService.isBusy.next(false),
      }),
      catchError(this.messageService.handleError<Blob>(`getting qr code as pdf from tournament ${tournament.id}`))
    );
  }
}