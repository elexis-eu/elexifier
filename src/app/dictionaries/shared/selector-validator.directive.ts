import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appAvailableNodesValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: SelectorValidatorDirective, multi: true}],
})
export class SelectorValidatorDirective implements Validator {
  @Input('appAvailableNodesValidator') public availableNodes;

  public validate(control: AbstractControl): {[key: string]: any} | null {
      if (control.value) {
        return this.validateNodes([...this.availableNodes, 'dummy'], control.value);
      }
      return {nonExistentSelector: true};
  }

  private validateNodes(availableNodes, value) {
    // TODO: Uncomment after xml_paths available again
    // let testValue = value;
    //
    // const allowedPrefixes = ['/', './', './/'];
    //
    // let usedPrefix;
    // allowedPrefixes.forEach((prefix) => {
    //   const startsWithPrefix = value.startsWith(prefix);
    //
    //   if (startsWithPrefix) {
    //     usedPrefix = prefix;
    //   }
    // });
    //
    // if (usedPrefix) {
    //   testValue = value.slice(usedPrefix.length, value.length);
    // }
    //
    // return availableNodes.indexOf(testValue) === -1 ? {nonExistentSelector: true} : null;

    return null;
  }
}
