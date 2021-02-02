import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayComponent } from './play/play.component';
import { BoardComponent } from './board/board.component';
import { ResponseComponent } from './response/response.component';

import { ButtonModule } from 'primeng/button';
import {CalendarModule} from "primeng/calendar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {DialogModule} from "primeng/dialog";

@NgModule({
  declarations: [
      AppComponent,
      PlayComponent,
      BoardComponent,
      ResponseComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        ButtonModule,
        CalendarModule,
        FormsModule,
        DialogModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
