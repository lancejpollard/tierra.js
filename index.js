
module.exports = tierra

function tierra() {
  return new File()
}

function File(name, head) {
  Object.defineProperty(this, 'base', { value: [] })
  Object.defineProperty(this, 'name', { value: name })
  Object.defineProperty(this, 'head', { value: head || [this] })
}

File.prototype.resource = function(obj) {
  this.base.push({
    type: 'resource',
    blob: obj
  })
}

File.prototype.variable = function(obj) {
  this.base.push({
    type: 'variable',
    blob: obj
  })
}

File.prototype.provider = function(obj) {
  this.base.push({
    type: 'provider',
    blob: obj
  })
}

File.prototype.output = function(obj) {
  this.base.push({
    type: 'output',
    blob: obj
  })
}

File.prototype.data = function(obj) {
  this.base.push({
    type: 'data',
    blob: obj
  })
}

File.prototype.module = function(obj) {
  const head = new File(obj.type)
  this.head.push(head)
  obj.blob.source = `./${obj.type}`
  this.base.push({
    type: 'module',
    blob: obj,
    head
  })
  return head
}

File.prototype.terraform = function(obj) {
  this.base.push({
    type: 'terraform',
    blob: obj
  })
}

File.prototype.forEach = function(fn) {
  this.head.forEach((file, i) => {
    let text = createFile(file)
    let name = file.name
    let blob = { text, name }
    fn(blob, i)
  })
}

function createFile(file) {
  let a = []
  file.base.forEach(record => {
    a.push(``)

    let z
    switch (record.type) {
      case 'resource':
        z = createResource(record.blob)
        break
      case 'variable':
        z = createVariable(record.blob)
        break
      case 'module':
        z = createModule(record.blob)
        break
      case 'output':
        z = createOutput(record.blob)
        break
      case 'data':
        z = createData(record.blob)
        break
      case 'provider':
        z = createProvider(record.blob)
        break
      case 'terraform':
        z = createTerraform(record.blob)
        break
    }

    z.forEach(x => {
      a.push(x)
    })
  })

  a.push(``)

  return a.join('\n')
}

function createResource(resource) {
  let arr = []
  arr.push(`resource "${resource.type}" "${resource.name}" {`)
  createMap(resource.blob).forEach(x => {
    arr.push(`  ${x}`)
  })
  arr.push(`}`)
  return arr
}

function createVariable(variable) {
  let arr = []
  arr.push(`variable "${variable.name}" {`)
  if (variable.blob.type) {
    variable.blob.type = {
      type: 'key',
      blob: variable.blob.type
    }
  }
  createMap(variable.blob).forEach(x => {
    arr.push(`  ${x}`)
  })
  arr.push(`}`)
  return arr
}

function createModule(mod) {
  let arr = []
  arr.push(`module "${mod.name}" {`)
  createMap(mod.blob).forEach(x => {
    arr.push(`  ${x}`)
  })
  arr.push(`}`)
  return arr
}

function createOutput(output) {
  let arr = []
  arr.push(`output "${output.name}" {`)
  createMap(output.blob).forEach(x => {
    arr.push(`  ${x}`)
  })
  arr.push(`}`)
  return arr
}

function createData(data) {
  let arr = []
  arr.push(`data "${data.type}" "${data.name}" {`)
  createMap(data.blob).forEach(x => {
    arr.push(`  ${x}`)
  })
  arr.push(`}`)
  return arr
}

function createProvider(provider) {
  let arr = []
  arr.push(`provider "${provider.name}" {`)
  createMap(provider.blob).forEach(x => {
    arr.push(`  ${x}`)
  })
  arr.push(`}`)
  return arr
}

function createTerraform(terraform) {
  let arr = []
  arr.push(`terraform {`)
  createMap(terraform.blob).forEach(x => {
    arr.push(`  ${x}`)
  })
  arr.push(`}`)
  return arr
}

function createValue(val) {
  let arr = []
  let typ = typeof val
  if (typ === 'object') {
    if (Array.isArray(val)) {
      arr.push(`[`)
      val.forEach(item => {
        createValue(item).forEach(x => {
          arr.push(`  ${x}`)
        })
      })
      arr.push(`]`)
    } else if (val.type === 'map') {
      arr.push(`{`)
      createMap(val.blob).forEach(x => {
        arr.push(`  ${x}`)
      })
      arr.push(`}`)
    } else if (val.type === 'key') {
      arr.push(`${val.blob}`)
    }
  } else if (typ === 'string') {
    arr.push(`"${val}"`)
  } else {
    arr.push(`${val}`)
  }
  return arr
}

function createKeyValue(key, val) {
  let arr = []
  let typ = typeof val
  if (typ === 'object') {
    if (Array.isArray(val)) {
      arr.push(`${key} = [`)
      val.forEach(item => {
        createValue(item).forEach(x => {
          arr.push(`  ${x}`)
        })
      })
      arr.push(`]`)
    } else if (val.type === 'block') {
      arr.push(``)
      arr.push(`${key} {`)
      createMap(val.blob).forEach(x => {
        arr.push(`  ${x}`)
      })
      arr.push(`}`)
    } else if (val.type === 'map') {
      arr.push(``)
      arr.push(`${key} = {`)
      createMap(val.blob).forEach(x => {
        arr.push(`  ${x}`)
      })
      arr.push(`}`)
    } else if (val.type === 'key') {
      arr.push(`${key} = ${val.blob}`)
    }
  } else if (typ === 'string') {
    arr.push(`${key} = "${val}"`)
  } else {
    arr.push(`${key} = ${val}`)
  }
  return arr
}

function createMap(map) {
  let arr = []
  Object.keys(map).forEach(key => {
    createKeyValue(key, map[key]).forEach(x => {
      arr.push(`${x}`)
    })
  })
  return arr
}

// resource "aws_acm_certificate_validation" "example" {
//   certificate_arn         = aws_acm_certificate.example.arn
//   validation_record_fqdns = [for record in aws_route53_record.example : record.fqdn]
// }

// resource "aws_route53_record" "example_mx" {
//   zone_id = "${aws_route53_zone.example.zone_id}"
//   name    = ""
//   type    = "MX"

//   base = [
//     "1 ASPMX.L.GOOGLE.COM",
//     "5 ALT1.ASPMX.L.GOOGLE.COM",
//     "5 ALT2.ASPMX.L.GOOGLE.COM",
//     "10 ASPMX2.GOOGLEMAIL.COM",
//     "10 ASPMX3.GOOGLEMAIL.COM",
//   ]

//   ttl = "${var.ttl}"
// }
