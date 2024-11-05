// eslint-env jest
/*
 * Copyright (c) 2011 Yahoo! Inc. All rights reserved.
 */
import { wrap } from '../src';

type demoCallback = (num: number, str: string, str2: string) => void;

const assertableCallback: demoCallback = (num, str, str2) => {
  expect(num).toEqual(1);
  expect(str).toEqual('foo');
  expect(str2).toEqual('hello');
};

const slowAssertableCallback: demoCallback = (...args) => {
  const foo: number[] = [];
  for (let i = 0; i < 100000; i += 1) {
    foo[i] = i;
  }
  for (let i = 0; i < 10; i += 1) {
    foo.sort((a, b) => a - b);
    foo.sort((a, b) => a + b);
  }
  assertableCallback(...args);
};

const getLogger = (message: string) => ({
  warn: (str: string): void => {
    expect(str.indexOf(message) === 0).toBe(true);
  },
});

/* eslint-env mocha */
/* eslint-disable func-names */
describe('callback-timer', () => {
  it('should wrap a callback object', () => {
    expect.assertions(3);
    const callback = wrap(assertableCallback);

    callback(1, 'foo', 'hello');
  });

  it('should accept a custom logger', () => {
    expect.assertions(4);
    const callback = wrap(
      {
        logger: getLogger('Call took '),
      },
      assertableCallback
    );

    callback(1, 'foo', 'hello');
  });

  it('should accept a tag', () => {
    expect.assertions(4);
    const callback = wrap(
      {
        tag: 'foo',
        logger: getLogger('[foo] Call took '),
      },
      assertableCallback
    );

    callback(1, 'foo', 'hello');
  });

  it('should accept a tag array', () => {
    expect.assertions(4);
    const callback = wrap(
      {
        tag: ['foo', 'bar'],
        logger: getLogger('[foo bar] Call took '),
      },
      assertableCallback
    );

    callback(1, 'foo', 'hello');
  });

  it('should accept a maxTimeWarning for determining call length', () => {
    expect.assertions(4);
    const callback = wrap(
      {
        maxTimeWarning: 20,
        tag: 'foo',
        logger: getLogger('[foo] Call took longer than 0.02 seconds - '),
      },
      slowAssertableCallback
    );

    callback(1, 'foo', 'hello');
  });

  it('should accept a method name to determine what the callback was for', () => {
    expect.assertions(4);
    const callback = wrap(
      {
        methodName: 'banana',
        tag: 'foo',
        logger: getLogger('[foo] Call (banana) took '),
      },
      assertableCallback
    );

    callback(1, 'foo', 'hello');
  });

  it('should not warn if maxTimeWarning and call was fast', () => {
    expect.assertions(3);
    const callback = wrap(
      {
        methodName: 'banana',
        maxTimeWarning: 20,
        tag: 'foo',
        logger: {
          warn() {
            throw new Error('should not call the logger');
          },
        },
      },
      assertableCallback
    );

    callback(1, 'foo', 'hello');
  });

  it('should accept useRelativeTime', () => {
    expect.assertions(3);
    const cb = (num: number, str: string) => {
      expect(num).toEqual(1);
      expect(str).toEqual('foo');
    };
    const callback = wrap(
      {
        logger: getLogger('Call took '),
        useRelativeTime: false,
      },
      cb
    );

    callback(1, 'foo');
  });
});
