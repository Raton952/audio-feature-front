import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {SocketIoModule} from "ngx-socket-io";
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot({
      // url: 'http://localhost:3000/',
      url: 'http://192.168.1.252:3000/',
      options: {
        transports: ['websocket']
      }
    }),
  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
