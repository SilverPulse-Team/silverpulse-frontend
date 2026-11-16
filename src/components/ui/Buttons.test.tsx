// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { Upload } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { SecondaryButton } from './Buttons'

describe('Buttons', () => {
  it('mantiene icono y texto en una sola fila', () => {
    render(<SecondaryButton><Upload aria-hidden="true" />Importar datos</SecondaryButton>)

    const content = screen.getByRole('button', { name: 'Importar datos' }).querySelector('span')
    expect(content?.className).toContain('inline-flex')
    expect(content?.className).toContain('flex-row')
    expect(content?.className).toContain('whitespace-nowrap')
  })
})
