import { describe, it } from '@ephox/bedrock-client';

import Sizzle from 'tinymce/core/api/dom/Sizzle';

describe('browser.tinymce.core.api.dom.Sizzle', () => {

  describe('selects anchors with GWT place parameters', () => {
    it('with placetoken', () => {
      const sizzle = Sizzle('a<a href="#!placetoken">b</a>c');

      sizzle.select();
    });
    it('with two parameters', () => {
      const sizzle = Sizzle('a<a href="#!placetoken;param1=value1;param2=value2">b</a>c');

      sizzle.select();
    });
    it('with trailing semicolon', () => {
      const sizzle = Sizzle('a<a href="#!placetoken;param1=value1;param2=value2;">b</a>c');

      sizzle.select();
    });
    it('with three parameters', () => {
      const sizzle = Sizzle('a<a href="#!placetoken;param1=value1;param2=value2;param3=value3">b</a>c');

      sizzle.select();
    });
  });
});
