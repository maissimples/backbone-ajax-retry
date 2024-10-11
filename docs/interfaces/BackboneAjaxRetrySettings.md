[**Backbone.js Retry Requests**](../README.md) • **Docs**

***

[Backbone.js Retry Requests](../README.md) / BackboneAjaxRetrySettings

# Interface: BackboneAjaxRetrySettings

## Properties

### condition?

> `optional` **condition**: [`BackboneAjaxRetryCondition`](../type-aliases/BackboneAjaxRetryCondition.md)

#### Defined in

[types.ts:29](https://github.com/maissimples/backbone-ajax-retry/blob/60e8d021af7d9c1744e2679ffcc20fd24996bb2a/src/types.ts#L29)

***

### delay?

> `optional` **delay**: [`BackboneAjaxRetryDelay`](../type-aliases/BackboneAjaxRetryDelay.md)

#### Default

```ts
linearDelay(1_000)
```

#### Defined in

[types.ts:24](https://github.com/maissimples/backbone-ajax-retry/blob/60e8d021af7d9c1744e2679ffcc20fd24996bb2a/src/types.ts#L24)

***

### retries?

> `optional` **retries**: `number`

#### Default

```ts
3
```

#### Defined in

[types.ts:27](https://github.com/maissimples/backbone-ajax-retry/blob/60e8d021af7d9c1744e2679ffcc20fd24996bb2a/src/types.ts#L27)
