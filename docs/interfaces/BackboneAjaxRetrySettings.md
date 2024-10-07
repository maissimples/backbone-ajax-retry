[**Backbone.js Retry Requests**](../README.md) • **Docs**

***

[Backbone.js Retry Requests](../README.md) / BackboneAjaxRetrySettings

# Interface: BackboneAjaxRetrySettings

## Properties

### condition?

> `optional` **condition**: [`BackboneAjaxRetryCondition`](BackboneAjaxRetryCondition.md)

#### Defined in

[types.ts:24](https://github.com/VitorLuizC/backbone-retry-requests/blob/14d556d1e82ad412ae05820dfa42281537b039ee/src/types.ts#L24)

***

### delay?

> `optional` **delay**: [`BackboneAjaxRetryDelay`](BackboneAjaxRetryDelay.md)

#### Default

```ts
linearDelay(1_000)
```

#### Defined in

[types.ts:19](https://github.com/VitorLuizC/backbone-retry-requests/blob/14d556d1e82ad412ae05820dfa42281537b039ee/src/types.ts#L19)

***

### retries?

> `optional` **retries**: `number`

#### Default

```ts
3
```

#### Defined in

[types.ts:22](https://github.com/VitorLuizC/backbone-retry-requests/blob/14d556d1e82ad412ae05820dfa42281537b039ee/src/types.ts#L22)
