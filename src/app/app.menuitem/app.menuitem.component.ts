import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AppMainComponent } from '../app.main/app.main.component';
import { AppMenuService } from '../app.menu/app.menu.service';

@Component({
  selector: '[app-menuitem]',
  templateUrl: './app.menuitem.component.html',
  host: {
    '[class.active-menuitem]': 'active',
    '[class.icon-active-menuitem]': 'iconActive',
  },
  animations: [
    trigger('children', [
      state('void', style({
        height: '0px'
      })),
      state('hiddenAnimated', style({
        height: '0px'
      })),
      state('visibleAnimated', style({
        height: '*'
      })),
      state('visible', style({
        height: '*',
        'z-index': 100
      })),
      state('hidden', style({
        height: '0px',
        'z-index': '*'
      })),
      transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('void => visibleAnimated, visibleAnimated => void', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
    ])
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ]
})
export class AppMenuitemComponent implements OnInit, OnDestroy {

  unsubscribe = new Subject();
  @Input() item: any;
  @Input() index: number;
  @Input() root: boolean;
  @Input() parentKey: string;
  active = false;
  /** Destaca o ícone no sidebar colapsado quando um filho está na rota ativa */
  iconActive = false;
  flyoutTop: number | null = null;
  menuSourceSubscription: Subscription;
  menuResetSubscription: Subscription;
  key: string;

  constructor(
    public appMain: AppMainComponent,
    public router: Router,
    private cd: ChangeDetectorRef,
    private menuService: AppMenuService,
    private el: ElementRef,
  ) {
    this.menuSourceSubscription = this.menuService.menuSource$.pipe(takeUntil(this.unsubscribe)).subscribe(key => {
      // deactivate current active menu
      if (this.active && this.key !== key && key.indexOf(this.key) !== 0) {
        this.active = false;
        this.flyoutTop = null;
      }
    });

    this.menuResetSubscription = this.menuService.resetSource$.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.active = false;
      this.flyoutTop = null;
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      if (this.appMain.isHorizontal()) {
        this.active = false;
      } else {
        if (this.item.routerLink) {
          this.updateActiveStateFromRoute();
        } else {
          const isCollapsed = this.appMain.menuCollapsed;
          // Colapsado: fecha o flyout ao navegar. Expandido: mantém o grupo aberto
          if (!this.item.items || isCollapsed) {
            this.active = false;
            this.flyoutTop = null;
          }
          // Colapsado: destaca o ícone do pai se um filho estiver na rota atual
          if (this.item.items) {
            this.iconActive = isCollapsed && this.hasActiveChild();
          }
        }
      }
    });
  }

  ngOnInit() {
    if (!this.appMain.isHorizontal() && this.item.routerLink) {
      this.updateActiveStateFromRoute();
    } else if (!this.appMain.isHorizontal() && this.item.items && this.appMain.menuCollapsed) {
      this.iconActive = this.hasActiveChild();
    }

    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);
  }

  updateActiveStateFromRoute() {
    this.active = this.router.isActive(this.item.routerLink[0], !this.item.items && !this.item.preventExact);
  }

  hasActiveChild(items: any[] = this.item.items): boolean {
    if (!items) return false;
    return items.some(child => {
      if (child.routerLink) {
        return this.router.isActive(child.routerLink[0], !child.preventExact);
      }
      return this.hasActiveChild(child.items);
    });
  }

  itemClick(event: Event) {

    this.appMain.itemMenuSelecionado(event);

    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // navigate with hover in horizontal mode
    if (this.root) {
      this.appMain.menuHoverActive = !this.appMain.menuHoverActive;
    }

    // notify other items
    this.menuService.onMenuStateChange(this.key);

    // execute command
    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (this.item.items) {
      this.active = !this.active;
      // Ao abrir o flyout manualmente, remove o destaque de "filho ativo"
      this.iconActive = false;
      if (this.active && this.appMain.menuCollapsed) {
        const rect = this.el.nativeElement.getBoundingClientRect();
        this.flyoutTop = rect.top;
      } else {
        this.flyoutTop = null;
      }
    } else {
      // activate item
      this.active = true;

      // hide overlay menus
      if (this.appMain.isMobile()) {
        this.appMain.sidebarActive = false;
        this.appMain.menuMobileActive = false;
      }

      // reset horizontal menu
      if (this.appMain.isHorizontal()) {
        this.menuService.reset();
      }
    }
  }

  onMouseEnter() {
    // activate item on hover
    if (this.root && this.appMain.menuHoverActive && this.appMain.isHorizontal() && this.appMain.isDesktop()) {
      this.menuService.onMenuStateChange(this.key);
      this.active = true;
    }
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
      this.unsubscribe.next(null);
      this.unsubscribe.complete();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
      this.unsubscribe.next(null);
      this.unsubscribe.complete();
    }
  }
}
