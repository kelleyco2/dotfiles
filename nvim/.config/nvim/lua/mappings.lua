vim.keymap.set({'n', 'v'}, ';', ':')
vim.keymap.set({'n', 'v'}, ':', ';')
vim.keymap.set('n', 'n', 'nzz')
vim.keymap.set('n', 'N', 'Nzz')
vim.keymap.set('n', '<leader>,', ':nohlsearch<CR>')
vim.keymap.set('n', '<bs>', ':b#<CR>')
vim.keymap.set('n', '<UP>', '<CMD>cope<CR>')
vim.keymap.set('n', '<DOWN>', '<CMD>cclose<CR>')
vim.keymap.set('n', '<RIGHT>', '<CMD>cnext<CR>')
vim.keymap.set('n', '<LEFT>', '<CMD>cprev<CR>')
