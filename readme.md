
```
npm install @lancejpollard/tierra.js
```

```js
const tierra = require('@lancejpollard/tierra.js')
const fs = require('fs')

const t = tierra()
t.terraform({
  blob: {
    required_version: '>= 0.12',
    required_providers: {
      type: 'block',
      blob: {
        aws: '~> 3.0.0'
      }
    }
  }
})
t.provider({
  name: 'aws',
  blob: {
    region: 'us-west-1'
  }
})
let m = t.module({
  type: 'env',
  name: 'staging',
  blob: {
    env: 'staging'
  }
})
m.resource({
  type: 'aws_lb',
  name: 'lb',
  blob: {
    foo: 'bar'
  }
})
m.variable({
  name: 'var1',
  blob: {
    type: 'string',
    default: 'foo'
  }
})
t.resource({
  type: 'aws_vpc',
  name: 'vpc',
  blob: {
    name: 'foo',
    bar: {
      type: 'block',
      blob: {
        baz: 123,
        bang: {
          type: 'block',
          blob: {
            eleven: true
          }
        }
      }
    },
    baz: {
      type: 'map',
      blob: {
        a: 1,
        b: true,
        c: 'three'
      }
    }
  }
})
t.forEach(blob => {
  if (blob.name) {
    if (!fs.existsSync(blob.name)) {
      fs.mkdirSync(blob.name)
    }
    fs.writeFileSync(`${blob.name}/main.tf`, blob.text)
  } else {
    fs.writeFileSync(`tmp/main.tf`, blob.text)
  }
})
```

```
terraform {
  required_version = ">= 0.12"

  required_providers {
    aws = "~> 3.0.0"
  }
}

provider "aws" {
  region = "us-west-1"
}

module "staging" {
  env = "staging"
  source = "./env"
}

resource "aws_vpc" "vpc" {
  name = "foo"

  bar {
    baz = 123

    bang {
      eleven = true
    }
  }

  baz = {
    a = 1
    b = true
    c = "three"
  }
}
```

```
resource "aws_lb" "lb" {
  foo = "bar"
}

variable "var1" {
  type = string
  default = "foo"
}
```
