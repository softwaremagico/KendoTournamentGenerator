import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSliderModule} from '@angular/material/slider';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ClubListComponent} from './views/club-list/club-list.component';
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import {MatMenuModule} from "@angular/material/menu";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDialogModule} from "@angular/material/dialog";
import {MatSortModule} from '@angular/material/sort';
import {MatInputModule} from "@angular/material/input";
import {LoginComponent} from "./views/login/login.component";
import {CookieService} from 'ngx-cookie-service';
import {MatSelectModule} from "@angular/material/select";
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatCardModule} from "@angular/material/card";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {BasicTableModule} from "./components/basic/basic-table/basic-table.module";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {IconModule} from "./components/icons";
import {registerLocaleData} from "@angular/common";
import localeES from "@angular/common/locales/es";
import localeCAT from "@angular/common/locales/ca-ES-valencia";
import localeIT from "@angular/common/locales/it";
import localeDE from "@angular/common/locales/de";
import localeNL from "@angular/common/locales/nds-NL";
import {MatTabsModule} from "@angular/material/tabs";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {PaginatorI18n} from "./components/basic/basic-table/paginator-i18n";
import {AuthenticatedUserListComponent} from './views/authenticated-user-list/authenticated-user-list.component';
import {PasswordsComponent} from './views/passwords/passwords.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {RbacModule} from "./pipes/rbac-pipe/rbac.module";
import {DrawModule} from "./components/fight/duel/draw/draw.module";
import {UserScoreModule} from "./components/fight/duel/user-score/user-score.module";
import {DuelModule} from "./components/fight/duel/duel.module";
import {MatSpinnerOverlayModule} from "./components/mat-spinner-overlay/mat-spinner-overlay.module";
import {FightModule} from "./components/fight/fight.module";
import {UntieFightModule} from "./components/untie-fight/untie-fight.module";
import {TimerModule} from "./components/timer/timer.module";
import {ConfirmationDialogModule} from "./components/basic/confirmation-dialog/confirmation-dialog.module";
import {
  AuthenticatedUserDialogBoxModule
} from "./views/authenticated-user-list/authenticated-user-dialog-box/authenticated-user-dialog-box.module";
import {ClubDialogBoxModule} from "./views/club-list/club-dialog-box/club-dialog-box.module";
import {CompetitorsRankingModule} from "./components/competitors-ranking/competitors-ranking.module";
import {FightDialogBoxModule} from "./views/fight-list/fight-dialog-box/fight-dialog-box.module";
import {LeagueGeneratorModule} from "./views/fight-list/league-generator/league-generator.module";
import {TeamRankingModule} from "./components/team-ranking/team-ranking.module";
import {UndrawTeamsModule} from "./views/fight-list/undraw-teams/undraw-teams.module";
import {
  ParticipantDialogBoxModule
} from "./views/participant-list/participant-dialog-box/participant-dialog-box.module";
import {TournamentTeamsModule} from "./views/tournament-list/tournament-teams/tournament-teams.module";
import {TournamentRolesModule} from "./views/tournament-list/tournament-roles/tournament-roles.module";
import {TournamentDialogBoxModule} from "./views/tournament-list/tournament-dialog-box/tournament-dialog-box.module";
import {FightListModule} from "./views/fight-list/fight-list-module";
import {FightStatisticsPanelModule} from "./components/fight-statistics-panel/fight-statistics-panel.module";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {WebcamModule} from "ngx-webcam";
import {
  ParticipantPictureDialogModule
} from "./views/participant-list/participant-dialog-box/participant-picture/participant-picture-dialog-box.module";
import {ParticipantPictureModule} from "./components/participant-picture/participant-picture.module";
import {PictureDialogBoxModule} from "./components/participant-picture/picture-dialog-box/picture-dialog-box.module";
import {
  TournamentImageSelectorModule
} from "./views/tournament-list/tournament-dialog-box/tournament-image-selector/tournament-image-selector.module";
import {
  TournamentScoreEditorModule
} from "./views/tournament-list/tournament-dialog-box/tournament-score-editor/tournament-score-editor.module";
import {RoleSelectorDialogBoxModule} from "./components/role-selector-dialog-box/role-selector-dialog-box.module";
import {AchievementTileModule} from "./components/achievement-tile/achievement-tile.module";
import {AchievementWallModule} from "./components/achievement-wall/achievement-wall.module";
import {BarChartModule} from "./components/charts/bar-chart/bar-chart.module";
import {TournamentStatisticsComponent} from './views/tournament-statistics/tournament-statistics.component';
import {PieChartModule} from "./components/charts/pie-chart/pie-chart.module";
import {StackedBarsChartModule} from "./components/charts/stacked-bars-chart/stacked-bars-chart.module";
import {LineChartModule} from "./components/charts/line-chart/line-chart.module";
import {NgApexchartsModule} from "ng-apexcharts";
import {RadarChartModule} from "./components/charts/radar-chart/radar-chart.module";
import {RadialChartModule} from "./components/charts/radial-chart/radial-chart.module";
import {GaugeChartModule} from "./components/charts/gauge-chart/gauge-chart.module";
import {ParticipantStatisticsComponent} from './views/participant-statistics/participant-statistics.component';
import {ProgressBarModule} from "./components/progress-bar/progress-bar.module";
import {HeaderInterceptor} from "./interceptors/header-interceptor";
import {HttpErrorInterceptor} from "./interceptors/http-error-interceptor";
import {TournamentListModule} from "./views/tournament-list/tournament-list.module";
import {ParticipantListModule} from "./views/participant-list/participant-list.module";
import {
  TournamentBracketsModule
} from "./components/tournament-brackets-editor/tournament-brackets/tournament-brackets.module";
import {ArrowModule} from "./components/tournament-brackets-editor/tournament-brackets/arrow/arrow.module";
import {ShiaijoModule} from "./components/tournament-brackets-editor/tournament-brackets/shiaijo/shiaijo.module";
import {LocalErrorHandler} from "./interceptors/local-error-handler.service";
import {
  TournamentBracketsEditorModule
} from "./components/tournament-brackets-editor/tournament-brackets-editor.module";
import {TournamentGeneratorModule} from "./views/fight-list/tournament-generator/tournament-generator.module";
import {
  TournamentExtraPropertiesModule
} from "./views/tournament-list/tournament-dialog-box/tournament-extra-properties/tournament-extra-properties.module";
import {RxStompService} from "./websockets/rx-stomp.service";
import {rxStompServiceFactory} from "./websockets/rx-stomp-service-factory";
import {TournamentQrCodeModule} from './components/tournament-qr-code/tournament-qr-code.module';
import {ParticipantQrCodeModule} from './components/participant-qr-code/participant-qr-code.module';
import {ParticipantFightListModule} from './views/participant-fight-list/participant-fight-list.module';


registerLocaleData(localeES, "es");
registerLocaleData(localeIT, "it");
registerLocaleData(localeCAT, "ca");
registerLocaleData(localeDE, "de");
registerLocaleData(localeNL, "nl");

@NgModule({
  declarations: [
    AppComponent,
    ClubListComponent,
    LoginComponent,
    AuthenticatedUserListComponent,
    PasswordsComponent,
    TournamentStatisticsComponent,
    ParticipantStatisticsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    AppRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    FormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSortModule,
    MatInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatCheckboxModule,
    BasicTableModule,
    MatAutocompleteModule,
    DragDropModule,
    IconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RbacModule,
    DrawModule,
    UserScoreModule,
    DuelModule,
    MatSpinnerOverlayModule,
    FightModule,
    UntieFightModule,
    TimerModule,
    ConfirmationDialogModule,
    AuthenticatedUserDialogBoxModule,
    ClubDialogBoxModule,
    CompetitorsRankingModule,
    FightDialogBoxModule,
    LeagueGeneratorModule,
    TeamRankingModule,
    ParticipantDialogBoxModule,
    ParticipantPictureDialogModule,
    TournamentTeamsModule,
    TournamentRolesModule,
    TournamentDialogBoxModule,
    UndrawTeamsModule,
    FightListModule,
    FightStatisticsPanelModule,
    MatSlideToggleModule,
    WebcamModule,
    ParticipantPictureModule,
    PictureDialogBoxModule,
    TournamentImageSelectorModule,
    TournamentScoreEditorModule,
    TournamentExtraPropertiesModule,
    RoleSelectorDialogBoxModule,
    AchievementTileModule,
    AchievementWallModule,
    BarChartModule,
    PieChartModule,
    StackedBarsChartModule,
    LineChartModule,
    RadarChartModule,
    NgApexchartsModule,
    RadialChartModule,
    GaugeChartModule,
    ProgressBarModule,
    TournamentListModule,
    ParticipantListModule,
    ProgressBarModule,
    TournamentBracketsModule,
    ArrowModule,
    ShiaijoModule,
    TournamentBracketsEditorModule,
    TournamentGeneratorModule,
    TournamentQrCodeModule,
    ParticipantQrCodeModule,
    ParticipantFightListModule,
  ],
  providers: [
    CookieService, {
      provide: MatPaginatorIntl,
      useFactory: (translate: TranslateService) => {
        const service: PaginatorI18n = new PaginatorI18n();
        service.injectTranslateService(translate);
        return service;
      },
      deps: [TranslateService]
    },
    {
      provide: ErrorHandler,
      useClass: LocalErrorHandler
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }, {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function httpTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
