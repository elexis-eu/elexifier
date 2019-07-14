import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
})
export class AutoFocusDirective implements OnInit {
  @Input() public autofocusEnabled: boolean;

  public constructor(public elementRef: ElementRef) {
  }

  public ngOnInit() {
    setTimeout(() => {
      if (this.autofocusEnabled) {
        this.elementRef.nativeElement.focus();
      }
    });
  }
}
