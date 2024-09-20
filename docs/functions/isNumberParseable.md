[**Backbone.js Retry Requests**](../README.md) • **Docs**

***

[Backbone.js Retry Requests](../README.md) / isNumberParseable

# Function: isNumberParseable()

> **isNumberParseable**(`value`): `value is NumberParseable`

Check if value is parseable to number.

## Parameters

• **value**: `unknown`

An `unknown` value to be checked.

## Returns

`value is NumberParseable`

## Example

```js
isNumberParseable('AAAA');
//=> false

isNumberParseable('100');
//=> true

if (!isNumberParseable(value))
  throw new Error('Value can\'t be parseable to `Number`.')
return Number(value);
```

## Defined in

[index.ts:24](https://github.com/VitorLuizC/backbone-retry-requests/blob/2323a1a4bc47eb1b6cf0e97e2869b976c300632c/src/index.ts#L24)
