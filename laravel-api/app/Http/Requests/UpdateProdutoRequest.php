<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProdutoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:1000'],
            'preco' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'quantidade_estoque' => ['sometimes', 'required', 'integer', 'min:0'],
            'categoria' => ['sometimes', 'required', 'string', 'max:100'],
            'ativo' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do produto é obrigatório.',
            'nome.min' => 'O nome do produto deve ter no mínimo 3 caracteres.',
            'preco.required' => 'O preço do produto é obrigatório.',
            'preco.numeric' => 'O preço deve ser um valor numérico válido.',
            'preco.min' => 'O preço deve ser maior que zero.',
            'quantidade_estoque.required' => 'A quantidade em estoque é obrigatória.',
            'quantidade_estoque.integer' => 'A quantidade em estoque deve ser um número inteiro.',
            'quantidade_estoque.min' => 'A quantidade em estoque não pode ser negativa.',
            'categoria.required' => 'A categoria é obrigatória.',
        ];
    }
}
