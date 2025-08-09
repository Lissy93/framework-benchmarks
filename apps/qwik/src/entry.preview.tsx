import { render } from '@builder.io/qwik';
import Root from './root';

export default function(opts: any) {
  return render(document.getElementById('app') as Element, <Root />, opts);
}