
// convert date to string with format (YYYY-MM-DD HH:mm)
export function dateToString(date) {
  return date.getUTCFullYear() + '-' + addZero(date.getUTCMonth() + 1) + '-' + addZero(date.getUTCDate()) + ' ' + addZero(date.getUTCHours()) + ':' + addZero(date.getUTCMinutes())
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function json_stringify(s, emit_unicode) {
  var json = JSON.stringify(s);
  return emit_unicode ? json : json.replace(/[\u007f-\uffff]/g,
    function (c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    }
  );
}

export function split_string_by_line(s) {
  return s.split(/\r?\n/)
}

// export function 