import { Component, OnInit } from '@angular/core';


import {Router} from "@angular/router";
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  createRoom() {
    console.log('createRoom');
    this.router.navigate([`/${uuidv4()}`]);
  }

}
