
// convert date to string with format (YYYY-MM-DD HH:mm)
export function dateToString(date) {
  return date.getUTCFullYear() + '-' + (date.getUTCMonth() > 9 ? date.getUTCMonth() + 1 : '0' + date.getUTCMonth() + 1) + '-' + date.getUTCDate() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes()
}

export function json_stringify(s, emit_unicode) {
  var json = JSON.stringify(s);
  return emit_unicode ? json : json.replace(/[\u007f-\uffff]/g,
    function (c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    }
  );
}

// export function 