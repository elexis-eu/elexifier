import { animate, group, query, style, transition, trigger } from '@angular/animations';

const transformTranslateX0 = 'translateX(0%)';
const easeInOut = '0.5s ease-in-out';

export const routerTransition = trigger('routerTransition', [
  transition('TransformationPage => TransformerEditPage', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%', height: '100%', overflow: 'scroll' })),
    query(':enter', style({ transform: 'translateX(100%)' })),

    group([
      query(':leave', [
        style({ transform: transformTranslateX0 }),
        animate(easeInOut, style({ transform: 'translateX(-100%)' })),
      ]),
      query(':enter', [
        animate(easeInOut, style({ transform: transformTranslateX0 })),
      ]),
    ]),
  ]),
  transition('TransformerEditPage => TransformationPage', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%', height: '100%', overflow: 'scroll' })),
    query(':enter', style({ transform: 'translateX(-100%)' })),

    group([
      query(':leave', [
        style({ transform: transformTranslateX0 }),
        animate(easeInOut, style({ transform: 'translateX(100%)' })),
      ]),
      query(':enter', [
        animate(easeInOut, style({ transform: transformTranslateX0 })),
      ]),
    ]),
  ]),
]);
