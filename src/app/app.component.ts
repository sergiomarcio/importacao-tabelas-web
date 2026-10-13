import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';
registerLocaleData(localePtBr);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet
  ]
})
export class AppComponent implements OnInit {

  horizontalMenu = false;
  darkMode = false;
  menuColorMode = 'light';
  menuColor = 'layout-menu-light';
  themeColor = 'blue';
  layoutColor = 'blue';
  ripple = true;
  inputStyle = 'outlined';
  lang: string = "ptbr";
  subscription: Subscription;
  config: any;

  constructor(
    private primengConfig: PrimeNGConfig,
  ) { }

  ngOnInit() {
    this.primengConfig.ripple = true;

  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

