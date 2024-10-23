import { Component, HostListener, HostBinding ,signal  } from '@angular/core';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  panelOpenState = signal(false);

  resizingEvent = {
    isResizing: false,
    startingCursorX: 0,
    startingWidth: 0,
  };
  constructor(public sidebarService: SidebarService) {}

  @HostBinding('class.is-expanded')
  get isExpanded() {
    return this.sidebarService.isExpanded;
  }


  @HostListener('window:mousemove', ['$event'])
updateSidenavWidth(event: MouseEvent) {
  // No need to even continue if we're not resizing
  if (!this.resizingEvent.isResizing) {
    return;
  }

  // 1. Calculate how much mouse has moved on the x-axis
  const cursorDeltaX = event.clientX - this.resizingEvent.startingCursorX;

  // 2. Calculate the new width according to initial width and mouse movement
  const newWidth = this.resizingEvent.startingWidth + cursorDeltaX;

  // 3. Set the new width
  this.sidebarService.setSidenavWidth(newWidth);
}

@HostListener('window:mouseup')
stopResizing() {
  this.resizingEvent.isResizing = false;
}

  startResizing(event: MouseEvent): void {
    this.resizingEvent = {
      isResizing: true,
      startingCursorX: event.clientX,
      startingWidth: this.sidebarService.sidenavWidth,
    };
  }



}
