location / {

	{% if extraDirectives %}
        
    {{ extraDirectives|indent(12) }}
        
    {% endif %}
    
    if ($uri ~ "\.php") {
        fastcgi_pass {{ php_bind }};

    }
    access_log  {{ tmpdir }}/access.log mine;
}

location ~ \.php$ {
    fastcgi_pass   {{ php_bind }};
    fastcgi_index  index.php;
    fastcgi_param SCRIPT_FILENAME {{ base }}$fastcgi_script_name;
    fastcgi_param SERVER_SOFTWARE {{ meta.name }}/{{ meta.version }};
}