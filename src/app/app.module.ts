import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayComponent } from './play/play.component';
import { BoardComponent } from './board/board.component';
import { ResponseComponent } from './response/response.component';
import { ReviewComponent } from './review/review.component';

import { ButtonModule } from 'primeng/button';
import {CalendarModule} from "primeng/calendar";
import {DialogModule} from "primeng/dialog";
import {SelectButtonModule} from "primeng/selectbutton";
import {ToolbarModule} from "primeng/toolbar";
import {PanelModule} from "primeng/panel";
import {TableModule} from "primeng/table";
import {CheckboxModule} from "primeng/checkbox";
import {ChipModule} from "primeng/chip";
import {TooltipModule} from "primeng/tooltip";
import {ChartModule} from "primeng/chart";


@NgModule({
  declarations: [
      AppComponent,
      PlayComponent,
      BoardComponent,
      ResponseComponent,
      ReviewComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        ButtonModule,
        CalendarModule,
        FormsModule,
        DialogModule,
        SelectButtonModule,
        ToolbarModule,
        PanelModule,
        TableModule,
        CheckboxModule,
        ChipModule,
        TooltipModule,
        ChartModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
