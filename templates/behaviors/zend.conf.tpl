location / {
    index index.php;
}

# Deny access to sensitive files.
location ~ (\.inc\.php|\.tpl|\.sql|\.tpl\.php|\.db)$ {
    deny all;
}
location ~ \.htaccess {
    deny all;
}

# Rewrite rule adapted from zendapp/public/.htaccess
if (!-e $request_filename) {
    rewrite ^.*$ /index.php last;
}

# PHP scripts will be forwarded to fastcgi processess.
# Remember that the `fastcgi_pass` directive must specify the same
# port on which `spawn-fcgi` runs.
location ~ \.php$ {
    include /etc/nginx/fastcgi_params;

    fastcgi_pass   {{ php_bind }};
    fastcgi_index  index.php;
    fastcgi_param SCRIPT_FILENAME {{ base }}$fastcgi_script_name;
    fastcgi_param SERVER_SOFTWARE {{ meta.name }}/{{ meta.version }};
    
    {% if extraDirectives %}
        
    {{ extraDirectives|indent(12) }}
        
    {% endif %}
}
