/*
 * Copyright (c) 2011 Yahoo! Inc. All rights reserved.
 */
import { expect, test, describe } from "vite-plus/test";
import { wrap } from "../src/index.ts";

type demoCallback = (num: number, str: string, str2: string) => void;

const assertableCallback: demoCallback = (num, str, str2) => {
  expect(num).toEqual(1);
  expect(str).toEqual("foo");
  expect(str2).toEqual("hello");
};

const slowAssertableCallback = async (...args: Parameters<demoCallback>) => {
  await new Promise((resolve) => setTimeout(resolve, 30));
  assertableCallback(...args);
};

const getLogger = (message: string) => ({
  warn: (str: string): void => {
    expect(str.indexOf(message) === 0).toBe(true);
  },
});

/* eslint-env mocha */
/* eslint-disable func-names */
describe("callback-timer", () => {
  test("should wrap a callback object", async () => {
    expect.assertions(3);
    const callback = wrap(assertableCallback);

    await callback(1, "foo", "hello");
  });

  test("should accept a custom logger", async () => {
    expect.assertions(4);
    const callback = wrap(
      {
        logger: getLogger("Call took "),
      },
      assertableCallback,
    );

    await callback(1, "foo", "hello");
  });

  test("should accept a tag", async () => {
    expect.assertions(4);
    const callback = wrap(
      {
        tag: "foo",
        logger: getLogger("[foo] Call took "),
      },
      assertableCallback,
    );

    await callback(1, "foo", "hello");
  });

  test("should accept a tag array", async () => {
    expect.assertions(4);
    const callback = wrap(
      {
        tag: ["foo", "bar"],
        logger: getLogger("[foo bar] Call took "),
      },
      assertableCallback,
    );

    await callback(1, "foo", "hello");
  });

  test("should accept a maxTimeWarning for determining call length", async () => {
    expect.assertions(4);
    const callback = wrap(
      {
        maxTimeWarning: 20,
        tag: "foo",
        logger: getLogger("[foo] Call took longer than 0.02 seconds - "),
      },
      slowAssertableCallback,
    );

    await callback(1, "foo", "hello");
  });

  test("should accept a method name to determine what the callback was for", async () => {
    expect.assertions(4);
    const callback = wrap(
      {
        methodName: "banana",
        tag: "foo",
        logger: getLogger("[foo] Call (banana) took "),
      },
      assertableCallback,
    );

    await callback(1, "foo", "hello");
  });

  test("should not warn if maxTimeWarning and call was fast", async () => {
    expect.assertions(3);
    const callback = wrap(
      {
        methodName: "banana",
        maxTimeWarning: 20,
        tag: "foo",
        logger: {
          warn() {
            throw new Error("should not call the logger");
          },
        },
      },
      assertableCallback,
    );

    await callback(1, "foo", "hello");
  });

  test("should accept useRelativeTime", async () => {
    expect.assertions(3);
    const cb = (num: number, str: string) => {
      expect(num).toEqual(1);
      expect(str).toEqual("foo");
    };
    const callback = wrap(
      {
        logger: getLogger("Call took "),
        useRelativeTime: false,
      },
      cb,
    );

    await callback(1, "foo");
  });
});
