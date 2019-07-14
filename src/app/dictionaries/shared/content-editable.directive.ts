import { Directive, ElementRef, forwardRef, HostBinding, HostListener, Renderer2 } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appContenteditable]',
  providers:
    [
      { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ContentEditableFormDirective), multi: true },
    ],
})
export class ContentEditableFormDirective implements ControlValueAccessor {
  @HostBinding('attr.appContenteditable') public enabled = true;

  private onChange: (value: string) => void;
  private onTouched: () => void;

  public constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  @HostListener('blur') public onBlur(): void {
    this.onTouched();
  }

  @HostListener('document:keydown.enter') public onEnter(): void {
    this.elementRef.nativeElement.blur();
  }

  @HostListener('input') public onInput(): void {
    this.elementRef.nativeElement.spellcheck = false;
    this.onChange(this.elementRef.nativeElement.innerText);
  }

  public registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  public registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  public setDisabledState(disabled: boolean): void {
    this.enabled = !disabled;
  }

  public writeValue(value: string): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'innerText', value || '');
  }
}
