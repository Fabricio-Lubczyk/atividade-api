<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    /** @use HasFactory<\Database\Factories\ProdutoFactory> */
    use HasFactory;

    protected $fillable = [
        'nome',
        'descricao',
        'preco',
        'quantidade_estoque',
        'categoria',
        'ativo',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'quantidade_estoque' => 'integer',
        'ativo' => 'boolean',
    ];
}
