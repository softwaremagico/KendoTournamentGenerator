import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {EnvironmentService} from "../environment.service";
import {MessageService} from "./message.service";
import {LoggerService} from "./logger.service";
import {LoginService} from "./login.service";
import {SystemOverloadService} from "./notifications/system-overload.service";
import {Participant} from "../models/participant";
import {Observable} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {ParticipantImage} from "../models/participant-image.model";

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = this.environmentService.getBackendUrl() + '/files';

  constructor(private http: HttpClient, private environmentService: EnvironmentService, private messageService: MessageService,
              private loggerService: LoggerService, public loginService: LoginService,
              private systemOverloadService: SystemOverloadService) {
  }

  addPicture(image: ParticipantImage): Observable<void> {
    const url: string = `${this.baseUrl}`;
    return this.http.post<void>(url, image, this.loginService.httpOptions)
      .pipe(
        tap({
          next: () => this.loggerService.info(`Adding picture to participant`),
          error: () => this.systemOverloadService.isBusy.next(false),
          complete: () => this.systemOverloadService.isBusy.next(false),
        }),
        catchError(this.messageService.handleError<void>(`adding picture to ${image}`))
      );
  }
}