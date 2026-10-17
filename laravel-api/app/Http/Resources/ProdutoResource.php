<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProdutoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'preco' => (float) $this->preco,
            'preco_formatado' => 'R$ ' . number_format((float) $this->preco, 2, ',', '.'),
            'quantidade_estoque' => (int) $this->quantidade_estoque,
            'em_estoque' => $this->quantidade_estoque > 0,
            'categoria' => $this->categoria,
            'ativo' => (bool) $this->ativo,
            'criado_em' => $this->created_at?->toIso8601String(),
            'criado_em_formatado' => $this->created_at?->format('d/m/Y H:i:s'),
            'atualizado_em' => $this->updated_at?->toIso8601String(),
            'atualizado_em_formatado' => $this->updated_at?->format('d/m/Y H:i:s'),
        ];
    }
}
