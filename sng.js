#!/usr/bin/env node
/*
** Copyright (c) 2011 Christphe Eymard, Félix Delval
**
** Permission is hereby granted, free of charge, to any person obtaining a copy
** of this software and associated documentation files (the "Software"), to deal
** in the Software without restriction, including without limitation the rights
** to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
** copies of the Software, and to permit persons to whom the Software is furnished
** to do so, subject to the following conditions:
**
** The above copyright notice and this permission notice shall be included in all
** copies or substantial portions of the Software.
** 
** THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
** IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
** FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
** THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
** LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
** OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
** THE SOFTWARE.
*/
var path, fs, sys, exec, child_process, console, util, http, argv, sngjs, colors, logme, emphasize;
path = require('path');
fs = require('fs');
sys = require('sys');
exec = require('child_process').exec;
child_process = require('child_process');
console = require('console');
util = require('util');
http = require('http');
argv = require('optimist').usage('start.py [basedir]')['default']({
  n: '127.0.0.1:8000',
  p: '127.0.0.1:9000'
}).alias({
  n: 'nginx-base',
  p: 'php-bind'
}).describe({
  n: 'Default binding NGinx wil be listening on',
  p: 'Default binding address for php-cgi'
}).argv;
sngjs = {
  prefix_dir: 'nginx-',
  php_bind: argv.p,
  nginx_bind: argv.n,
  kill: 0,
  fresh: true
};
if (argv._.length > 0) {
  sngjs.base = argv._[0];
} else {
  sngjs.base = path.resolve();
}
colors = {
  chead: '\033[96;1m',
  cblue: '\033[94;1m',
  cgreen: '\033[92;1m',
  cred: '\033[91;1m',
  cyellow: '\033[93;1m',
  cfail: '\033[91m',
  cend: '\033[0m'
};
logme = function(data, arrow){
  arrow == null && (arrow = true);
  if (arrow) {
    return console.log('  ' + colors.cgreen + '==>' + colors.cend + ' ' + data);
  } else {
    return console.log('   ' + data);
  }
};
emphasize = function(data){
  return colors.chead + data + colors.cend;
};
exec('mktemp -d /tmp/' + sngjs.prefix_dir + 'XXXXXXX', function(err, stdout, stderr){
  var print_stdout, print_stderr, print_accesslog, killed;
  if (err !== null) {
    console.log('exec error:' + err);
    process.exit()['else'];
  }
  sngjs.tmpdir = stdout.substr(0, stdout.length - 1);
  sngjs.access_log = sngjs.tmpdir + '/access.log';
  sngjs.error_log = sngjs.tmpdir + '/error.log';
  logme('NGinx temporary directory is ' + emphasize(sngjs.tmpdir));
  sngjs.nginx_conf = "error_log   " + sngjs.tmpdir + "/error.log;\npid " + sngjs.tmpdir + "/pid;\ndaemon off;\n\nevents {\n    worker_connections  4096;\n}\n\nhttp {\n    fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;\n    fastcgi_param  SERVER_SOFTWARE    nginx;\n    fastcgi_param  QUERY_STRING       $query_string;\n    fastcgi_param  REQUEST_METHOD     $request_method;\n    fastcgi_param  CONTENT_TYPE       $content_type;\n    fastcgi_param  CONTENT_LENGTH     $content_length;\n    fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;\n    fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;\n    fastcgi_param  REQUEST_URI        $request_uri;\n    fastcgi_param  DOCUMENT_URI       $document_uri;\n    fastcgi_param  DOCUMENT_ROOT      $document_root;\n    fastcgi_param  SERVER_PROTOCOL    $server_protocol;\n    fastcgi_param  REMOTE_ADDR        $remote_addr;\n    fastcgi_param  REMOTE_PORT        $remote_port;\n    fastcgi_param  SERVER_ADDR        $server_addr;\n    fastcgi_param  SERVER_PORT        $server_port;\n    fastcgi_param  SERVER_NAME        $server_name;\n\n    client_body_temp_path " + sngjs.tmpdir + "/client_body_temp;\n    proxy_temp_path " + sngjs.tmpdir + "/proxy_t'emp;\n    fastcgi_temp_path " + sngjs.tmpdir + "/fastcgi_temp;\n    uwsgi_temp_path " + sngjs.tmpdir + "/uwsgi_temp;\n    scgi_temp_path " + sngjs.tmpdir + "/scgi_temp;\n\n    if_modified_since off;\n    log_format mine '$request||$status||$request_length||$request_time||$remote_addr||$bytes_sent';\n    access_log  " + sngjs.tmpdir + "/access.log mine;\n\n    gzip_types text/plain text/css text/xml text/javascript application/x-javascript;\n\n    server {\n        listen " + sngjs.nginx_bind + ";\n\n        index       index.php index.html index.html;\n        root        " + sngjs.base + ";\n\n        location / {\n\n            if ($uri ~ \".php\") {\n                fastcgi_pass " + sngjs.php_bind + ";\n            }\n            access_log  " + sngjs.tmpdir + "/access.log mine;\n        }\n    }\n\n    types {\n        text/html                             html htm shtml;\n        text/css                              css;\n        text/xml                              xml;\n        image/gif                             gif;\n        image/jpeg                            jpeg jpg;\n        application/x-javascript              js;\n        application/atom+xml                  atom;\n        application/rss+xml                   rss;\n\n        text/mathml                           mml;\n        text/plain                            txt;\n        text/vnd.sun.j2me.app-descriptor      jad;\n        text/vnd.wap.wml                      wml;\n        text/x-component                      htc;\n\n        image/png                             png;\n        image/tiff                            tif tiff;\n        image/vnd.wap.wbmp                    wbmp;\n        image/x-icon                          ico;\n        image/x-jng                           jng;\n        image/x-ms-bmp                        bmp;\n        image/svg+xml                         svg;\n\n        application/java-archive              jar war ear;\n        application/mac-binhex40              hqx;\n        application/msword                    doc;\n        application/pdf                       pdf;\n        application/postscript                ps eps ai;\n        application/rtf                       rtf;\n        application/vnd.ms-excel              xls;\n        application/vnd.ms-powerpoint         ppt;\n        application/vnd.wap.wmlc              wmlc;\n        application/vnd.google-earth.kml+xml  kml;\n        application/vnd.google-earth.kmz      kmz;\n        application/x-7z-compressed           7z;\n        application/x-cocoa                   cco;\n        application/x-java-archive-diff       jardiff;\n        application/x-java-jnlp-file          jnlp;\n        application/x-makeself                run;\n        application/x-perl                    pl pm;\n        application/x-pilot                   prc pdb;\n        application/x-rar-compressed          rar;\n        application/x-redhat-package-manager  rpm;\n        application/x-sea                     sea;\n        application/x-shockwave-flash         swf;\n        application/x-stuffit                 sit;\n        application/x-tcl                     tcl tk;\n        application/x-x509-ca-cert            der pem crt;\n        application/x-xpinstall               xpi;\n        application/xhtml+xml                 xhtml;\n        application/zip                       zip;\n\n        application/octet-stream              bin exe dll;\n        application/octet-stream              deb;\n        application/octet-stream              dmg;\n        application/octet-stream              eot;\n        application/octet-stream              iso img;\n        application/octet-stream              msi msp msm;\n\n        audio/midi                            mid midi kar;\n        audio/mpeg                            mp3;\n        audio/ogg                             ogg;\n        audio/x-realaudio                     ra;\n\n        video/3gpp                            3gpp 3gp;\n        video/mpeg                            mpeg mpg;\n        video/quicktime                       mov;\n        video/x-flv                           flv;\n        video/x-mng                           mng;\n        video/x-ms-asf                        asx asf;\n        video/x-ms-wmv                        wmv;\n        video/x-msvideo                       avi;\n    }\n}";
  sngjs.conffilename = path.join(sngjs.tmpdir, 'nginx.conf');
  fs.writeFileSync(sngjs.conffilename, sngjs.nginx_conf);
  fs.writeFileSync(sngjs.access_log, '');
  fs.writeFileSync(sngjs.error_log, '');
  print_stdout = function(data){
    return sys.print(data.toString());
  };
  print_stderr = function(data){
    var str;
    str = data.toString();
    if (sngjs.fresh) {
      return sngjs.fresh = false;
    } else {
      return sys.print(colors.cred + data.toString() + colors.cend);
    }
  };
  print_accesslog = function(data){
    var mdata, line, request, mode, url, proto, status, length, time, fro, bytes_sent;
    mdata = data.toString();
    line = mdata.split('||');
    request = line[0].split(' ');
    mode = request[0];
    url = request[1];
    proto = request[2];
    status = line[1];
    length = line[2];
    time = line[3];
    fro = line[4];
    bytes_sent = parseInt(line[5]) / 1024;
    if (parseInt(status) >= 400) {
      status = colors.cred + status + colors.cend;
    } else {
      status = colors.cgreen + status + colors.cend;
    }
    return console.log(colors.cblue + mode + colors.cend + ' ' + colors.cyellow + url + colors.cend + ' ' + status + ' (' + colors.chead + fro + colors.cend + ') ' + colors.cblue + bytes_sent + colors.cend + 'Kb, ' + colors.cblue + time + colors.cend + 's');
  };
  killed = function(){
    sngjs.kill += 1;
    if (sngjs.kill >= 2) {
      return process.exit();
    }
  };
  logme('Starting PHP CGI on ' + emphasize(sngjs.php_bind));
  sngjs.php = child_process.spawn('php-cgi', ['-b', sngjs.php_bind, '-q']);
  sngjs.php.stdout.on('data', print_stdout);
  sngjs.php.stderr.on('data', print_stderr);
  sngjs.php.on('exit', killed);
  logme("Starting NGinx CGI on " + emphasize(sngjs.nginx_bind));
  sngjs.nginx = child_process.spawn('nginx', ['-c', sngjs.conffilename]);
  sngjs.nginx.stdout.on('data', print_stdout);
  sngjs.nginx.stderr.on('data', print_stderr);
  sngjs.nginx.on('exit', killed);
  sngjs.tail = child_process.spawn('tail', ['-f', sngjs.access_log]);
  sngjs.tail.stdout.on('data', print_accesslog);
  sngjs.tail.on('exit', killed);
  sngjs.err = child_process.spawn('tail', ['-f', sngjs.error_log]);
  sngjs.err.stdout.on('data', print_stderr);
  sngjs.err.on('exit', killed);
  process.stdin.resume();
  return process.on('SIGINT', function(){
    console.log('Interrupted');
    sngjs.tail.kill('SIGINT');
    sngjs.nginx.kill('SIGINT');
    sngjs.php.kill('SIGINT');
    return sngjs.err.kill('SIGINT');
  });
});
