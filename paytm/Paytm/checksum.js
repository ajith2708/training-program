"use strict";

let crypt = require('./crypt');
let util = require('util');
let crypto = require('crypto');

//mandatory flag: when it set, only mandatory parameters are added to checksum

let paramsToString=(params, mandatoryflag)=>{
  let data = '';
  let tempKeys = Object.keys(params);
  tempKeys.sort();
  tempKeys.forEach(function (key) {
  let n = params[key].includes("REFUND"); 
   let m = params[key].includes("|");  
        if(n == true )
        {
          params[key] = "";
        }
          if(m == true)
        {
          params[key] = "";
        }  
    if (key !== 'CHECKSUMHASH' ) {
      if (params[key] === 'null') params[key] = '';
      if (!mandatoryflag || mandatoryParams.indexOf(key) !== -1) {
        data += (params[key] + '|');
      }
    }
});
  return data;
}


let genchecksum=(params, key, cb)=> {
  let data = paramsToString(params);
crypt.gen_salt(4, function (err, salt) {
    let sha256 = crypto.createHash('sha256').update(data + salt).digest('hex');
    let check_sum = sha256 + salt;
    let encrypted = crypt.encrypt(check_sum, key);
    cb(undefined, encrypted);
  });
}
let genchecksumbystring=(params, key, cb) =>{

  crypt.gen_salt(4, function (err, salt) {
    let sha256 = crypto.createHash('sha256').update(params + '|' + salt).digest('hex');
    let check_sum = sha256 + salt;
    let encrypted = crypt.encrypt(check_sum, key);

     let CHECKSUMHASH = encodeURIComponent(encrypted);
     CHECKSUMHASH = encrypted;
    cb(undefined, CHECKSUMHASH);
  });
}

let verifychecksum=(params, key, checksumhash)=> {
  let data = paramsToString(params, false);

  //TODO: after PG fix on thier side remove below two lines
  if (typeof checksumhash !== "undefined") {
    checksumhash = checksumhash.replace('\n', '');
    checksumhash = checksumhash.replace('\r', '');
    let temp = decodeURIComponent(checksumhash);
    let checksum = crypt.decrypt(temp, key);
    let salt = checksum.substr(checksum.length - 4);
    let sha256 = checksum.substr(0, checksum.length - 4);
    let hash = crypto.createHash('sha256').update(data + salt).digest('hex');
    if (hash === sha256) {
      return true;
    } else {
      util.log("checksum is wrong");
      return false;
    }
  } else {
    util.log("checksum not found");
    return false;
  }
}

let verifychecksumbystring=(params, key,checksumhash)=> {

    let checksum = crypt.decrypt(checksumhash, key);
    let salt = checksum.substr(checksum.length - 4);
    let sha256 = checksum.substr(0, checksum.length - 4);
    let hash = crypto.createHash('sha256').update(params + '|' + salt).digest('hex');
    if (hash === sha256) {
      return true;
    } else {
      util.log("checksum is wrong");
      return false;
    }
  } 

let genchecksumforrefund=(params, key, cb)=> {
  let data = paramsToStringrefund(params);
crypt.gen_salt(4, function (err, salt) {
    let sha256 = crypto.createHash('sha256').update(data + salt).digest('hex');
    let check_sum = sha256 + salt;
    let encrypted = crypt.encrypt(check_sum, key);
      params.CHECKSUM = encodeURIComponent(encrypted);
    cb(undefined, params);
  });
}

let paramsToStringrefund=(params, mandatoryflag)=> {
  let data = '';
  let tempKeys = Object.keys(params);
  tempKeys.sort();
  tempKeys.forEach(function (key) {
   let m = params[key].includes("|");  
          if(m == true)
        {
          params[key] = "";
        }  
    if (key !== 'CHECKSUMHASH' ) {
      if (params[key] === 'null') params[key] = '';
      if (!mandatoryflag || mandatoryParams.indexOf(key) !== -1) {
        data += (params[key] + '|');
      }
    }
});
  return data;
}

module.exports.genchecksum = genchecksum;
module.exports.verifychecksum = verifychecksum;
module.exports.verifychecksumbystring = verifychecksumbystring;
module.exports.genchecksumbystring = genchecksumbystring;
module.exports.genchecksumforrefund = genchecksumforrefund;